export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-medium">Not Found</h2>
      <p className="text-muted-foreground">
        Could not find the requested resource.
      </p>
    </div>
  );
}
