import { ChatComponent } from './ChatComponent';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assistant Médical</h1>
        <p className="mt-2 text-gray-600">
          Posez vos questions médicales et recevez des conseils personnalisés.
        </p>
      </div>
      <ChatComponent />
    </div>
  );
} 