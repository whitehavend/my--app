import { useAppSelector } from "../Store/hooks";

const LogisticPage = () => {
  const { user } = useAppSelector((state) => state.auth);

  return <main className="min-h-screen bg-gray-100 px-4 py-10"><section className="mx-auto max-w-2xl rounded-md bg-white p-6 shadow-sm"><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Logistic dashboard</p><h1 className="mt-2 text-3xl font-bold">Logistic contact details</h1><dl className="mt-6 space-y-4"><div><dt className="text-sm text-gray-500">Full name</dt><dd className="font-medium">{user.displayName}</dd></div><div><dt className="text-sm text-gray-500">Phone number</dt><dd className="font-medium">{user.countryCode} {user.phoneNumber}</dd></div></dl></section></main>;
};

export default LogisticPage;
