import { useMemo, useState } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = getCountries()
  .map((country) => ({
    country,
    name: displayNames.of(country) || country,
    code: `+${getCountryCallingCode(country)}`,
  }))
  .sort((first, second) => first.name.localeCompare(second.name));

const CountryPhoneField = ({ register, errors, label = "Phone number" }) => {
  const [countrySearch, setCountrySearch] = useState("");
  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    return countries.filter(({ name, code }) => !query || name.toLowerCase().includes(query) || code.includes(query));
  }, [countrySearch]);

  return (
    <div className="my-4">
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_minmax(0,1fr)]">
        <div>
          <input
            type="search"
            value={countrySearch}
            onChange={(event) => setCountrySearch(event.target.value)}
            placeholder="Search country or code"
            aria-label="Search country or country code"
            className="mb-2 w-full rounded-md border border-gray-400 p-3 outline-none focus:border-primary"
          />
          <select
            aria-label="Country code"
            {...register("countryCode", { required: "Country code is required" })}
            className="w-full rounded-md border border-gray-400 bg-white p-3 outline-none focus:border-primary"
          >
            <option value="">Select country code</option>
            {filteredCountries.map(({ country, name, code }) => (
              <option key={`${country}-${code}`} value={code}>{name} ({code})</option>
            ))}
          </select>
        </div>
        <input
          type="tel"
          placeholder="Phone number"
          {...register("phoneNumber", { required: "Phone number is required" })}
          className="w-full rounded-md border border-gray-400 p-3 outline-none focus:border-primary"
        />
      </div>
      {errors.countryCode && <p className="mt-1 text-xs text-red-500">{errors.countryCode.message}</p>}
      {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
    </div>
  );
};

export default CountryPhoneField;
