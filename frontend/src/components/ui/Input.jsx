function Input({ label, ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-medium text-[#26313b]">
          {label}
        </span>
      )}

      <input
        className="w-full rounded-lg border border-[#ddd7d0] bg-white px-4 py-3 text-sm text-[#26313b] outline-none transition placeholder:text-[#9a9a96] focus:border-[#b9825f] focus:ring-2 focus:ring-[#b9825f]/10"
        {...props}
      />
    </label>
  );
}

export default Input;
