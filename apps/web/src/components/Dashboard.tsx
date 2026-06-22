/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { cn } from "@/lib/utils";
import { OrganizationSwitcher, useOrganization, UserButton, useUser } from "@clerk/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
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
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Entry, Chicken, DashboardData, EntryType, ExpenseReason } from "@/lib/types";

interface DashboardProps {
  orgId: string;
  orgName: string;
}

export default function Dashboard({ orgId, orgName }: DashboardProps) {
  const { memberships } = useOrganization({ memberships: { pageSize: 20, keepPreviousData: true } });
  const { user } = useUser();
  const [currentTab, setCurrentTab] = useState<"prehlad" | "hejno" | "dennik" | "rodina">("prehlad");
  const [activeModuleId, setActiveModuleId] = useState("vajcia");

  const todayDate = new Date().toLocaleDateString("en-CA");

  // Fetch dashboard data (today's entry, last 30 entries)
  const dashboardData = useQuery(api.entries.getDashboardData, {
    orgId,
    moduleId: activeModuleId,
    today: todayDate,
  }) as DashboardData | undefined;

  // Fetch all entries for Denník tab
  const allEntries = useQuery(api.entries.list, { orgId }) as Entry[] | undefined;

  // Fetch chickens list for Hejno tab
  const chickens = useQuery(api.chickens.list, { orgId }) as Chicken[] | undefined;

  // Mutations
  const upsertEntry = useMutation(api.entries.upsert);
  const deleteEntry = useMutation(api.entries.remove);
  const generateUploadUrl = useMutation(api.chickens.generateUploadUrl);
  const createChicken = useMutation(api.chickens.create);
  const deleteChicken = useMutation(api.chickens.remove);
  const updateChickenCount = useMutation(api.chickens.updateCount);

  // Form State (Logger date tracking)
  const [selectedDate, setSelectedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Edit Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editValue, setEditValue] = useState(0);
  const [editNote, setEditNote] = useState("");
  const [editReason, setEditReason] = useState<ExpenseReason>("predaj");
  const [isUpdatingEntry, setIsUpdatingEntry] = useState(false);

  // Confirm Dialog State
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmVariant, setConfirmVariant] = useState<"danger" | "default">("default");

  const triggerConfirm = (
    title: string,
    description: string,
    onConfirm: () => void,
    variant: "danger" | "default" = "default"
  ) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmAction(() => onConfirm);
    setConfirmVariant(variant);
    setConfirmOpen(true);
  };

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

  const handleSave = async (args: {
    value: number;
    note: string;
    type: EntryType;
    reason?: ExpenseReason;
    date: string;
  }) => {
    setIsSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await upsertEntry({
        orgId,
        moduleId: activeModuleId,
        date: args.date,
        value: args.value,
        note: args.note.trim() || undefined,
        type: args.type,
        reason: args.reason,
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

  const handleStartEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setEditValue(entry.value);
    setEditNote(entry.note || "");
    setEditReason(entry.reason || "predaj");
    setEditDialogOpen(true);
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
        type: editingEntry.type || "income",
        reason: editingEntry.type === "expense" ? editReason : undefined,
      });
      setEditDialogOpen(false);
      setEditingEntry(null);
    } catch (err) {
      console.error(err);
      setErrorMsg("Chyba pri aktualizácii záznamu.");
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
      setErrorMsg("Chyba pri pridávaní do hejna.");
    } finally {
      setIsSavingChicken(false);
    }
  };

  const handleIncrementChicken = async (chickenId: string, currentCount: number) => {
    try {
      await updateChickenCount({ orgId, id: chickenId as Id<"chickens">, count: currentCount + 1 });
    } catch (err) {
      console.error(err);
      setErrorMsg("Chyba pri zmene stavu.");
    }
  };

  const handleDecrementChicken = async (chickenId: string, currentCount: number) => {
    if (currentCount <= 1) {
      triggerConfirm(
        "Odstrániť plemeno?",
        "Naozaj chcete odstrániť toto plemeno z hejna?",
        async () => {
          try {
            await deleteChicken({ orgId, id: chickenId as Id<"chickens"> });
          } catch (err) {
            console.error(err);
            setErrorMsg("Chyba pri odstraňovaní z hejna.");
          }
        },
        "danger"
      );
      return;
    }
    try {
      await updateChickenCount({ orgId, id: chickenId as Id<"chickens">, count: currentCount - 1 });
    } catch (err) {
      console.error(err);
      setErrorMsg("Chyba pri zmene stavu.");
    }
  };

  const handleDeleteChicken = async (chickenId: string) => {
    triggerConfirm(
      "Vymazať plemeno?",
      "Naozaj chcete vymazať toto plemeno z hejna?",
      async () => {
        try {
          await deleteChicken({ orgId, id: chickenId as Id<"chickens"> });
        } catch (err) {
          console.error(err);
          setErrorMsg("Chyba pri odstraňovaní z hejna.");
        }
      },
      "danger"
    );
  };

  const handleDeleteEntry = async (entryId: string) => {
    triggerConfirm(
      "Vymazať záznam?",
      "Naozaj chcete vymazať tento záznam z denníka?",
      async () => {
        try {
          await deleteEntry({ orgId, id: entryId as Id<"entries"> });
        } catch (err) {
          console.error(err);
          setErrorMsg("Chyba pri mazaní záznamu.");
        }
      },
      "danger"
    );
  };

  return (
    <div className="min-h-screen bg-bg-base font-inter pb-32 selection:bg-accent-light selection:text-accent-primary animate-fade-in">
      {/* Floating Sticky Header - Rounded, Fat & Modern */}
      <div className="w-full sticky top-3 sm:top-4 z-30 px-3 sm:px-0">
        <header className="mx-auto max-w-5xl bg-bg-surface/90 backdrop-blur-md rounded-2xl py-3 px-4 sm:px-5 flex items-center justify-between h-18 border-none">
          <Logo />
          
          {/* Navigation Tabs Header - Desktop (Capsule / Pill Style, Integrated in Header) */}
          <div className="hidden md:flex bg-bg-base/50 p-1 rounded-xl gap-1 shrink-0">
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
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer border-none select-none",
                    active
                      ? "bg-accent-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-base/30"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

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

        {/* Navigation Tabs Header - Mobile Sticky Bottom Bar (Floating Bubble Pill) */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 bg-bg-surface/95 backdrop-blur-md border border-border-default/40 py-2.5 px-3 z-40 flex items-center justify-around rounded-full max-w-sm mx-auto">
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
                className="flex flex-col items-center gap-0.5 flex-1 py-0.5 cursor-pointer border-none bg-transparent select-none text-center"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200",
                    active ? "bg-accent-light/85 text-accent-primary" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-wider transition-colors uppercase font-inter",
                    active ? "text-accent-primary" : "text-text-muted"
                  )}
                >
                  {tab.label}
                </span>
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
            onStartEdit={handleStartEdit}
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
        editReason={editReason}
        setEditReason={setEditReason}
        isUpdatingEntry={isUpdatingEntry}
        onSubmit={handleUpdateEntry}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={confirmTitle}
        description={confirmDescription}
        variant={confirmVariant}
        onConfirm={() => {
          if (confirmAction) confirmAction();
        }}
      />
    </div>
  );
}
