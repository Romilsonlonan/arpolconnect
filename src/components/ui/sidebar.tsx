

"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { Menu, ChevronsLeft, ChevronsRight } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH_MOBILE = "18rem"

type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      children,
      ...props
    },
    ref
  ) => {

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp ?? _open

    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        if (typeof document !== 'undefined') {
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
        setOpen(prev => !prev);
    }, [setOpen])


    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        open,
        setOpen,
        toggleSidebar,
      }),
      [open, setOpen, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div ref={ref} {...props}>
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
    const { open, toggleSidebar } = useSidebar()
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
             <Sheet open={open} onOpenChange={useSidebar().setOpen}>
                <SheetContent side="left" className="flex flex-col w-[160px] p-0 bg-primary">
                     {children}
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <div
            ref={ref}
            data-state={open ? 'open' : 'closed'}
            className={cn(
            "hidden md:flex flex-col h-full bg-primary text-primary-foreground relative",
            !open && "w-16 items-center",
            className,
            )}
            {...props}
        >
            {children}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 -right-4 translate-y-[-50%] rounded-full h-8 w-8 bg-primary hover:bg-primary/80 text-primary-foreground hover:text-primary-foreground"
                onClick={toggleSidebar}
            >
                {open ? <ChevronsLeft /> : <ChevronsRight />}
            </Button>
        </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  const isMobile = useIsMobile();
  
  if(!isMobile) return null;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <Menu />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex h-14 items-center border-b border-primary/20 p-4 lg:h-[60px] lg:px-6", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-2 p-2 mt-auto", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"


const SidebarBody = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex-1", className)}
      {...props}
    />
  )
})
SidebarBody.displayName = "SidebarBody"

const SidebarNav = React.forwardRef<
  HTMLElement,
  React.ComponentProps<"nav">
>(({ className, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <nav
      ref={ref}
      className={cn(
        "grid items-start text-sm font-medium", 
        open ? "px-2 lg:px-4" : "px-2",
        className
      )}
      {...props}
    />
  )
})
SidebarNav.displayName = "SidebarNav"

type SidebarNavItemProps = {
    href: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
}

const SidebarNavItem = ({href, label, icon, active}: SidebarNavItemProps) => {
    const { open } = useSidebar();
    
    if (!open) {
      return (
         <Tooltip>
            <TooltipTrigger asChild>
                <a
                    href={href}
                    className={cn(
                        "flex items-center justify-center gap-3 rounded-lg px-3 py-2 text-primary-foreground/80 transition-all hover:text-primary-foreground",
                        active && "bg-primary/20 text-primary-foreground",
                    )}
                    >
                    {icon}
                </a>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
      )
    }

    return (
        <a
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground/80 transition-all hover:text-primary-foreground",
                active && "bg-primary/20 text-primary-foreground",
            )}
            >
            {icon}
            <span className='truncate'>{label}</span>
        </a>
    );
}
SidebarNavItem.displayName = "SidebarNavItem";


export {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
