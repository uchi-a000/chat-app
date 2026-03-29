type FormErrorProps = {
  messages?: string[];
};

export function FormError({ messages }: FormErrorProps) {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="space-y-1">
      {messages.map((message) => (
        <p key={message} className="text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      ))}
    </div>
  );
}
