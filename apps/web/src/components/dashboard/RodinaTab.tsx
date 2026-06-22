import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import React from "react";

interface RodinaTabProps {
  memberships: any;
  user: any;
}

export default function RodinaTab({ memberships, user }: RodinaTabProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col">
        <h3 className="font-nunito text-xl font-extrabold text-text-primary flex items-center gap-2">
          <Users className="h-5 w-5 text-accent-primary" />
          Členovia rodiny
        </h3>
        <p className="text-sm font-medium text-text-muted">
          Zoznam členov rodiny, ktorí majú prístup k tejto farme.
        </p>
      </div>

      {memberships?.data === undefined ? (
        <div className="h-32 w-full animate-pulse rounded-2xl bg-bg-surface" />
      ) : (
        <Card className="bg-bg-surface rounded-2xl overflow-hidden border border-border-default/30 shadow-none">
          <CardContent className="p-0">
            {memberships?.data?.map((membership: any, idx: number) => {
              const member = membership.publicUserData;
              const isMe = member.userId === user?.id;
              const roleName = membership.role === "org:admin" ? "Správca" : "Člen";
              const initials =
                [member.firstName?.[0], member.lastName?.[0]].filter(Boolean).join("") ||
                member.identifier?.[0]?.toUpperCase() ||
                "?";
              return (
                <div key={membership.id}>
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.firstName || member.identifier || ""}
                        className="w-11 h-11 rounded-full object-cover shrink-0 bg-bg-base"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-accent-light flex items-center justify-center shrink-0">
                        <span className="font-inter text-base font-bold text-accent-primary">
                          {initials}
                        </span>
                      </div>
                    )}

                    {/* Name & email */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text-primary leading-tight">
                          {member.firstName || member.lastName
                            ? [member.firstName, member.lastName].filter(Boolean).join(" ")
                            : member.identifier}
                        </span>
                        {isMe && (
                          <span className="shrink-0 text-[10px] font-semibold text-accent-primary bg-accent-light rounded-full px-2 py-0.5 leading-none">
                            Vy
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-text-muted mt-0.5 truncate">
                        {member.identifier}
                      </span>
                    </div>

                    {/* Role badge */}
                    <div className="shrink-0">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-xl",
                          membership.role === "org:admin"
                            ? "bg-accent-light text-accent-primary"
                            : "bg-bg-base/60 text-text-muted"
                        )}
                      >
                        {roleName}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  {idx < (memberships.data?.length ?? 0) - 1 && (
                    <div className="h-[1px] w-full bg-bg-base" />
                  )}
                </div>
              );
            })}

            {/* Footer */}
            <div className="border-t border-bg-base px-5 py-3">
              <span className="text-xs font-medium text-text-muted">
                {memberships?.data?.length ?? 0}{" "}
                {(memberships?.data?.length ?? 0) === 1
                  ? "člen"
                  : (memberships?.data?.length ?? 0) >= 2 && (memberships?.data?.length ?? 0) <= 4
                    ? "členovia"
                    : "členov"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
