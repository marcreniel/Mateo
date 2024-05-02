interface Props {
  onTestEmail: () => Promise<void>;
}

export default function TestEmailServerComponent({ onTestEmail }: Props) {
  return (
    <button
      onClick={() => onTestEmail()}
      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow w-full mb-2"
    >
      Send Test Email
    </button>
  );
}