"use client";

import { useOrganization, useUser } from "@clerk/nextjs";
import { OrganizationSwitcher } from "@clerk/nextjs";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  // Show a clean loading state while Clerk is initializing
  if (!isOrgLoaded || !isUserLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-primary border-t-transparent"></div>
          <p className="text-base text-text-muted font-medium">Načítavam farmu...</p>
        </div>
      </div>
    );
  }

  // If the user does not have an active organization, show the onboarding screen
  if (!organization) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {/* Logo/Icon placeholder using Lucide-style markup */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-light text-accent-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>

            <h1 className="font-nunito text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Vitajte vo Finik Farme!
            </h1>
            <p className="mt-3 text-base text-text-muted font-normal leading-relaxed">
              Pre pokračovanie si vyberte farmu, do ktorej ste boli pozvaní, alebo vytvorte novú.
            </p>

            <div className="mt-8 w-full flex justify-center">
              <OrganizationSwitcher
                hidePersonal={true}
                afterCreateOrganizationUrl="/"
                afterSelectOrganizationUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full max-w-xs",
                    organizationSwitcherTrigger:
                      "w-full justify-between border border-border-strong rounded-lg px-4 py-3 bg-bg-surface hover:bg-bg-surface-raised transition text-text-primary font-semibold text-base h-12",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the dashboard for the active organization
  return <Dashboard orgId={organization.id} orgName={organization.name} />;
}
