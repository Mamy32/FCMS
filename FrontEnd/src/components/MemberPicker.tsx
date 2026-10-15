import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useList } from "@/hooks/useApi";
import { fullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Member } from "@/types";

// Searchable member selector — a plain dropdown becomes unusable with hundreds of members.
const MemberPicker = ({ value, onChange }: { value: string; onChange: (id: string) => void }) => {
  const [open, setOpen] = useState(false);
  const { data: members = [] } = useList<Member>("/members");
  const selected = members.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? fullName(selected) : "Search member..."}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Name, email or phone..." />
          <CommandList>
            <CommandEmpty>No member found.</CommandEmpty>
            <CommandGroup>
              {members.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`${fullName(m)} ${m.email} ${m.phone || ""} ${m.id}`}
                  onSelect={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === m.id ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0">
                    <p className="truncate">{fullName(m)}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MemberPicker;
