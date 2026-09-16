import { useAppSelector } from "../Store/hooks";

const AdvertPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const socials = Object.entries(user.advertSocials || {});

  return <main className="min-h-screen bg-gray-100 px-4 py-10"><section className="mx-auto max-w-2xl rounded-md bg-white p-6 shadow-sm"><p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Advert dashboard</p><h1 className="mt-2 text-3xl font-bold">Your advertising platforms</h1><p className="mt-2 text-gray-600">Signed in as {user.displayName} · {user.email}</p><div className="mt-6 space-y-3">{socials.map(([platform, username]) => <div key={platform} className="flex items-center justify-between rounded-md border border-gray-200 p-4"><span className="capitalize">{platform}</span><span className="font-medium text-primary">@{username}</span></div>)}{!socials.length && <p className="text-gray-600">No advertising platforms selected.</p>}</div></section></main>;
};

export default AdvertPage;
