import { useSelector } from "react-redux";

const verificationMap = {
  retailshopvendor: [
    { key: "kyc", label: "KYC verification", required: true },
    { key: "kra", label: "KRA tax details", required: true },
    { key: "settlement", label: "Financial settlement info", required: true },
  ],
  realestate: [
    { key: "kyc", label: "KYC verification", required: true },
  ],
  cardealer: [
    { key: "kyc", label: "KYC verification", required: true },
  ],
  pharmacy: [
    { key: "kyc", label: "KYC verification", required: true },
    { key: "kra", label: "KRA tax details", required: true },
    { key: "financialGateway", label: "Financial gateway validation", required: true },
    { key: "professionalLicense", label: "Professional license", required: true },
    { key: "premisesLicense", label: "Premises verification", required: true },
    { key: "settlement", label: "Financial settlement info", required: true },
  ],
  agrovet: [
    { key: "kyc", label: "KYC verification", required: true },
    { key: "kra", label: "KRA tax details", required: true },
    { key: "financialGateway", label: "Financial gateway validation", required: true },
    { key: "professionalLicense", label: "Professional license", required: true },
    { key: "premisesLicense", label: "Premises verification", required: true },
    { key: "settlement", label: "Financial settlement info", required: true },
  ],
};

const VendorVerificationStatus = () => {
  const { user } = useSelector((state) => state.auth);
  const checks = verificationMap[user?.vendorType] || verificationMap.retailshopvendor;

  const getStatus = (key) => {
    const status = user?.verificationStatus || {};
    if (key === "kyc") return status.kycVerified ? "Verified" : "Pending";
    if (key === "kra") return status.kraVerified ? "Verified" : "Pending";
    if (key === "financialGateway") return status.financialGatewayVerified ? "Verified" : "Pending";
    if (key === "professionalLicense") return status.professionalLicenseVerified ? "Verified" : "Pending";
    if (key === "premisesLicense") return status.premisesLicenseVerified ? "Verified" : "Pending";
    if (key === "settlement") return status.financialSettlementVerified ? "Verified" : "Pending";
    return "Pending";
  };

  return (
    <main className="min-h-[60vh] bg-gray-50 px-4 py-10">
      <section className="mx-auto max-w-4xl rounded-md bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Vendor status</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Verification overview</h1>
        </div>

        <div className="mb-6 rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          Vendor type: <span className="font-semibold">{user?.vendorType || "Not assigned"}</span>
        </div>

        <div className="space-y-3">
          {checks.map((check) => {
            const status = getStatus(check.key);
            const isVerified = status === "Verified";

            return (
              <div key={check.key} className="flex items-center justify-between rounded-md border border-gray-200 p-4">
                <div>
                  <p className="font-medium text-gray-900">{check.label}</p>
                  <p className="text-sm text-gray-500">{check.required ? "Required" : "Optional"}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default VendorVerificationStatus;
