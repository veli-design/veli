export default function MembersPage() {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="type-body-lg-semibold text-base-strong">Members</h2>
      <p className="type-body-md-regular text-base-default">
        Route content for <code>/team/members</code>. This tab relies on{' '}
        <code>VeliProvider.navigate</code>.
      </p>
    </div>
  );
}
