import { notFound } from "next/navigation";
import { getEventRegistrations } from "@/lib/actions/admin-event";
import { RegistrationDashboard } from "@/components/admin/events/registration-dashboard";

export const metadata = {
    title: "Event Registrations | Runwal Seagull Admin",
    description: "View and manage event registrations",
};

interface RegistrationsPageProps {
    params: Promise<{ id: string }>;
}

export default async function RegistrationsPage({
    params,
}: RegistrationsPageProps) {
    const { id } = await params;
    const result = await getEventRegistrations(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const { event, registrations, stats } = result.data;

    return (
        <RegistrationDashboard
            event={event}
            registrations={registrations}
            stats={stats}
        />
    );
}
