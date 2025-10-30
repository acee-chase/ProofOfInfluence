import AddLinkButton from "../AddLinkButton";

export default function AddLinkButtonExample() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <AddLinkButton onClick={() => console.log("Add link clicked")} />
    </div>
  );
}
