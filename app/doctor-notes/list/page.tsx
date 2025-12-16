'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Calendar, FileText } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface DoctorNote {
  id: string;
  text: string;
  originalText: string;
  createdAt: string;
}

export default function DoctorNotesListPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<DoctorNote[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('doctorNotes') || '[]');
    const sorted = savedNotes.sort((a: DoctorNote, b: DoctorNote) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setNotes(sorted);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Doktor Notları</h1>
          <p className="text-gray-600">Yazdığınız tüm notlar</p>
        </div>

        {notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Henüz not yok
            </h2>
            <p className="text-gray-600 mb-6">
              İlk notunuzu yazmak için "Doktor Notu Yaz" butonuna tıklayın.
            </p>
            <Link
              href="/doctor-notes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Yeni Not Yaz
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(note.createdAt)}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(note.text, note.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
                  >
                    {copiedId === note.id ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-800 whitespace-pre-wrap">{note.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

