
import React, { useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type CountryCode = {
  name: string;
  dial_code: string;
  code: string;
  flag: string;
};

const countryCodes: CountryCode[] = [
  { name: "Poland", dial_code: "+48", code: "PL", flag: "🇵🇱" },
  { name: "United States", dial_code: "+1", code: "US", flag: "🇺🇸" },
  { name: "Germany", dial_code: "+49", code: "DE", flag: "🇩🇪" },
  { name: "United Kingdom", dial_code: "+44", code: "GB", flag: "🇬🇧" },
  { name: "France", dial_code: "+33", code: "FR", flag: "🇫🇷" },
  { name: "Spain", dial_code: "+34", code: "ES", flag: "🇪🇸" },
  { name: "Italy", dial_code: "+39", code: "IT", flag: "🇮🇹" },
  { name: "Netherlands", dial_code: "+31", code: "NL", flag: "🇳🇱" },
  { name: "Sweden", dial_code: "+46", code: "SE", flag: "🇸🇪" },
  { name: "Norway", dial_code: "+47", code: "NO", flag: "🇳🇴" },
  { name: "Denmark", dial_code: "+45", code: "DK", flag: "🇩🇰" },
  { name: "Finland", dial_code: "+358", code: "FI", flag: "🇫🇮" },
  { name: "Switzerland", dial_code: "+41", code: "CH", flag: "🇨🇭" },
  { name: "Austria", dial_code: "+43", code: "AT", flag: "🇦🇹" },
  { name: "Belgium", dial_code: "+32", code: "BE", flag: "🇧🇪" },
  { name: "Czech Republic", dial_code: "+420", code: "CZ", flag: "🇨🇿" },
  { name: "Ukraine", dial_code: "+380", code: "UA", flag: "🇺🇦" },
];

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  onCountryChange?: (value: string) => void;
  className?: string;
}

export function PhoneInput({ 
  value, 
  onChange, 
  countryCode = "PL", 
  onCountryChange, 
  className,
  ...props 
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>(
    countryCodes.find((c) => c.code === countryCode)
  );

  useEffect(() => {
    const country = countryCodes.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
    }
  }, [countryCode]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setOpen(false);
    if (onCountryChange) {
      onCountryChange(country.code);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, spaces, and a leading plus sign
    const sanitizedValue = e.target.value.replace(/[^\d\s+]/g, "");
    onChange(sanitizedValue);
  };

  return (
    <div className="flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="flex items-center gap-1 px-3 rounded-r-none border-r-0"
            onClick={() => setOpen(!open)}
            type="button"
          >
            <span className="text-lg">{selectedCountry?.flag}</span>
            <span className="hidden sm:inline-block text-xs font-normal">
              {selectedCountry?.dial_code}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="Szukaj kraju..." />
            <CommandList>
              <CommandEmpty>Nie znaleziono kraju</CommandEmpty>
              <CommandGroup>
                {countryCodes.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.dial_code}`}
                    onSelect={() => handleCountrySelect(country)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {country.dial_code}
                    </span>
                    {selectedCountry?.code === country.code && (
                      <Check className="h-4 w-4 ml-1" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        className={cn("rounded-l-none", className)}
        {...props}
      />
    </div>
  );
}
