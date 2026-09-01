function VerificationBadge({ verified = false }) {
  if (!verified) {
    return null;
  }

  return (
    <span className="inline-flex items-center rounded-full bg-[#edf7f1] px-2.5 py-1 text-xs font-semibold text-[#28734a]">
      Verified
    </span>
  );
}

export default VerificationBadge;