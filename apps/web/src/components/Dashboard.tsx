//@ts-nocheck
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { cn } from "@/lib/utils";
import { OrganizationSwitcher, useOrganization, UserButton, useUser } from "@clerk/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";

// Date & Icons
import { Activity, BookOpen, Layers, Users } from "lucide-react";

// Presets Catalog
import { CHICKEN_BREED_PRESETS } from "@/lib/presets";

// Refactored Sub-components
import DennikTab from "./dashboard/DennikTab";
import EditEntryDialog from "./dashboard/EditEntryDialog";
import HejnoTab from "./dashboard/HejnoTab";
import PrehladTab from "./dashboard/PrehladTab";
import RodinaTab from "./dashboard/RodinaTab";
import Logo from "./common/Logo";

interface DashboardProps {
  orgId: string;
  orgName: string;
}

export default function Dashboard({ orgId, orgName }: DashboardProps) {
  const { memberships } = useOrganization({ memberships: { pageSize: 20, keepPreviousData: true } });
  const { user } = useUser();
  const [currentTab, setCurrentTab] = useState<"prehlad" | "hejno" | "dennik" | "rodina" | any>("prehlad");
  const [activeModuleId, setActiveModuleId] = useState("vajcia");

  // Fetch modules for this farm
  const modules = useQuery(api.modules.list, { orgId });

  const todayDate = new Date().toLocaleDateString("en-CA");

  // Fetch dashboard data (today's entry, last 30 entries)
  const dashboardData = useQuery(api.entries.getDashboardData, {
    orgId,
    moduleId: activeModuleId,
    today: todayDate,
  });

  // Fetch all entries for Denník tab
  const allEntries = useQuery(api.entries.list, { orgId });

  // Fetch chickens list for Hejno tab
  const chickens = useQuery(api.chickens.list, { orgId });

  // Mutations
  const upsertEntry = useMutation(api.entries.upsert);
  const deleteEntry = useMutation(api.entries.remove);
  const generateUploadUrl = useMutation(api.chickens.generateUploadUrl);
  const createChicken = useMutation(api.chickens.create);
  const deleteChicken = useMutation(api.chickens.remove);
  const updateChickenCount = useMutation(api.chickens.updateCount);

  // Form State (Logger)
  const [selectedDate, setSelectedDate] = useState("");
  const [value, setValue] = useState(0);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [editValue, setEditValue] = useState(0);
  const [editNote, setEditNote] = useState("");
  const [isUpdatingEntry, setIsUpdatingEntry] = useState(false);

  // Dialog (Add Chicken) state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBreedPreset, setSelectedBreedPreset] = useState("leghornka");
  const [customName, setCustomName] = useState("");
  const [countInput, setCountInput] = useState(1);
  const [colorInput, setColorInput] = useState("#2C4E3A"); // Default forest sage
  const [notesInput, setNotesInput] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSavingChicken, setIsSavingChicken] = useState(false);
  const [hatchedDateInput, setHatchedDateInput] = useState("");

  // Set today's date in local YYYY-MM-DD on component mount
  useEffect(() => {
    setSelectedDate(todayDate);
    setHatchedDateInput(todayDate);
  }, [todayDate]);

  // Update value state when user changes date (to load existing value if any from allEntries)
  useEffect(() => {
    if (allEntries && selectedDate) {
      const match = allEntries.find(
        (e) => e.date === selectedDate && e.moduleId === activeModuleId
      );
      if (match) {
        setValue(match.value);
        setNote(match.note || "");
      } else {
        setValue(0);
        setNote("");
      }
    }
  }, [selectedDate, allEntries, activeModuleId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await upsertEntry({
        orgId,
        moduleId: activeModuleId,
        date: selectedDate,
        value,
        note: note.trim() || undefined,
      });

      setSuccessMsg("Záznam uložený do denníka.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Chyba pri ukladaní.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    setIsUpdatingEntry(true);
    try {
      await upsertEntry({
        orgId,
        moduleId: activeModuleId,
        date: editingEntry.date,
        value: editValue,
        note: editNote.trim() || undefined,
      });
      setEditDialogOpen(false);
      setEditingEntry(null);
    } catch (err) {
      console.error(err);
      alert("Chyba pri aktualizácii záznamu.");
    } finally {
      setIsUpdatingEntry(false);
    }
  };

  const handleAddChicken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingChicken(true);
    try {
      let storageId: string | undefined = undefined;

      // Handle custom file upload if custom breed and file selected
      if (selectedBreedPreset === "custom" && uploadFile) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": uploadFile.type,
          },
          body: uploadFile,
        });

        if (!res.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await res.json();
        storageId = data.storageId;
      }

      let name = "";
      let color = colorInput;
      let presetId: string | undefined = undefined;

      if (selectedBreedPreset === "custom") {
        name = customName.trim() || "Vlastné plemeno";
      } else {
        const preset = CHICKEN_BREED_PRESETS.find((p) => p.presetId === selectedBreedPreset);
        name = preset?.name || "Plemeno";
        color = preset?.color || "#CD7F32";
        presetId = selectedBreedPreset;
      }

      await createChicken({
        orgId,
        name,
        count: countInput,
        color,
        notes: notesInput.trim() || undefined,
        storageId,
        presetId,
        hatchedDate: selectedBreedPreset === "kuriatko" ? hatchedDateInput || undefined : undefined,
      });

      // Clear state and close dialog
      setCustomName("");
      setCountInput(1);
      setColorInput("#2C4E3A");
      setNotesInput("");
      setUploadFile(null);
      setSelectedBreedPreset("leghornka");
      setHatchedDateInput(todayDate);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Chyba pri pridávaní do hejna.");
    } finally {
      setIsSavingChicken(false);
    }
  };

  const handleIncrementChicken = async (chickenId: string, currentCount: number) => {
    try {
      await updateChickenCount({ orgId, id: chickenId as any, count: currentCount + 1 });
    } catch (err) {
      console.error(err);
      alert("Chyba pri zmene stavu.");
    }
  };

  const handleDecrementChicken = async (chickenId: string, currentCount: number) => {
    if (currentCount <= 1) {
      if (window.confirm("Naozaj chcete odstrániť toto plemeno z hejna?")) {
        try {
          await deleteChicken({ orgId, id: chickenId as any });
        } catch (err) {
          console.error(err);
          alert("Chyba pri odstraňovaní z hejna.");
        }
      }
      return;
    }
    try {
      await updateChickenCount({ orgId, id: chickenId as any, count: currentCount - 1 });
    } catch (err) {
      console.error(err);
      alert("Chyba pri zmene stavu.");
    }
  };

  const handleDeleteChicken = async (chickenId: string) => {
    if (!window.confirm("Naozaj chcete vymazať toto plemeno z hejna?")) return;
    try {
      await deleteChicken({ orgId, id: chickenId as any });
    } catch (err) {
      console.error(err);
      alert("Chyba pri odstraňovaní z hejna.");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm("Naozaj chcete vymazať tento záznam z denníka?")) return;
    try {
      await deleteEntry({ orgId, id: entryId as any });
    } catch (err) {
      console.error(err);
      alert("Chyba pri mazaní záznamu.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-base font-inter pb-32 selection:bg-accent-light selection:text-accent-primary animate-fade-in">
      {/* Floating Sticky Header - Rounded, Fat & Modern */}
      <div className="w-full sticky top-3 sm:top-4 z-30 px-3 sm:px-0">
        <header className="mx-auto max-w-5xl bg-bg-surface/90 backdrop-blur-md rounded-2xl py-3 px-4 sm:px-5 flex items-center justify-between h-18 border-none">
          <Logo />
          <div className="flex items-center gap-3.5">
            <OrganizationSwitcher
              hidePersonal={true}
              afterCreateOrganizationUrl="/"
              afterSelectOrganizationUrl="/"
              appearance={{
                elements: {
                  rootBox: "flex items-center max-w-[140px] sm:max-w-none",
                  organizationSwitcherTrigger:
                    "border-0 rounded-xl px-3.5 py-1.5 bg-bg-base/60 hover:bg-bg-base transition text-text-primary font-semibold text-sm truncate max-w-full",
                },
              }}
            />
            <UserButton />
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 mt-6 flex flex-col gap-6">
        {/* Title Section */}
        <div className="flex flex-col gap-1">
          <h2 className="font-nunito text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">
            {orgName}
          </h2>
          <p className="text-xs sm:text-sm text-text-muted font-medium tracking-wide uppercase">
            Zápisník hospodárstva
          </p>
        </div>

        {/* Navigation Tabs Header - Capsule / Pill Style */}
        <div className="bg-bg-surface p-1 rounded-2xl flex gap-1.5 overflow-x-auto scrollbar-none flex-nowrap shrink-0">
          {[
            { id: "prehlad", label: "Prehľad", icon: Activity },
            { id: "hejno", label: "Hejno", icon: Layers },
            { id: "dennik", label: "Denník", icon: BookOpen },
            { id: "rodina", label: "Rodina", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer border-none",
                  active
                    ? "bg-accent-primary text-white"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-base/50"
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab contents */}
        {currentTab === "prehlad" && (
          <PrehladTab
            orgId={orgId}
            activeModuleId={activeModuleId}
            setActiveModuleId={setActiveModuleId}
            dashboardData={dashboardData}
            allEntries={allEntries}
            chickens={chickens}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            todayDate={todayDate}
            value={value}
            setValue={setValue}
            note={note}
            setNote={setNote}
            isSubmitting={isSubmitting}
            successMsg={successMsg}
            errorMsg={errorMsg}
            handleSave={handleSave}
          />
        )}

        {currentTab === "hejno" && (
          <HejnoTab
            orgId={orgId}
            chickens={chickens}
            handleIncrementChicken={handleIncrementChicken}
            handleDecrementChicken={handleDecrementChicken}
            handleDeleteChicken={handleDeleteChicken}
            handleAddChicken={handleAddChicken}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            selectedBreedPreset={selectedBreedPreset}
            setSelectedBreedPreset={setSelectedBreedPreset}
            colorInput={colorInput}
            setColorInput={setColorInput}
            customName={customName}
            setCustomName={setCustomName}
            uploadFile={uploadFile}
            setUploadFile={setUploadFile}
            countInput={countInput}
            setCountInput={setCountInput}
            notesInput={notesInput}
            setNotesInput={setNotesInput}
            isSavingChicken={isSavingChicken}
            hatchedDateInput={hatchedDateInput}
            setHatchedDateInput={setHatchedDateInput}
          />
        )}

        {currentTab === "dennik" && (
          <DennikTab
            activeModuleId={activeModuleId}
            setActiveModuleId={setActiveModuleId}
            allEntries={allEntries}
            todayDate={todayDate}
            userId={user?.id}
            handleDeleteEntry={handleDeleteEntry}
            setEditingEntry={setEditingEntry}
            setEditValue={setEditValue}
            setEditNote={setEditNote}
            setEditDialogOpen={setEditDialogOpen}
            memberships={memberships}
            user={user}
          />
        )}

        {currentTab === "rodina" && (
          <RodinaTab
            memberships={memberships}
            user={user}
          />
        )}
      </main>

      {/* Edit Entry Dialog */}
      <EditEntryDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingEntry(null);
        }}
        editingEntry={editingEntry}
        editValue={editValue}
        setEditValue={setEditValue}
        editNote={editNote}
        setEditNote={setEditNote}
        isUpdatingEntry={isUpdatingEntry}
        onSubmit={handleUpdateEntry}
      />
    </div>
  );
}
