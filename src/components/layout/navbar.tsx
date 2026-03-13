"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">DocAI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {session && (
            <>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Chat
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/chat" className="flex items-center w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
