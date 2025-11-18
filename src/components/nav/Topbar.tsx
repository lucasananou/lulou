import { UserButton } from "@clerk/nextjs";
import { getCurrentWorkspace } from "@/lib/auth";

export async function Topbar() {
  const workspace = await getCurrentWorkspace();

  return (
    <div className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">{workspace.name}</h2>
      </div>
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
}

