import { useState } from "react";
import { CheckCircle2, XCircle, Sparkles, AlertCircle } from "lucide-react";
import CyberButton from "@/components/CyberButton";
import { Badge } from "@/components/ui/badge";

// Mock pending questions
const mockPendingQuestions = [
  {
    id: 1,
    question: "L'authentification à deux facteurs (2FA) est une mesure de sécurité inutile pour les comptes personnels",
    answer: false,
    category: "Sécurité",
    aiGenerated: true,
  },
  {
    id: 2,
    question: "Il est recommandé de changer régulièrement son mot de passe même sans raison",
    answer: false,
    category: "Mots de passe",
    aiGenerated: true,
  },
  {
    id: 3,
    question: "Les VPN protègent votre navigation sur les réseaux Wi-Fi publics",
    answer: true,
    category: "Réseaux",
    aiGenerated: true,
  },
];

export default function Admin() {
  const [pendingQuestions, setPendingQuestions] = useState(mockPendingQuestions);
  const [stats] = useState({
    pending: 3,
    validated: 47,
    rejected: 12,
  });

  const handleValidate = (id: number) => {
    setPendingQuestions(pendingQuestions.filter(q => q.id !== id));
  };

  const handleReject = (id: number) => {
    setPendingQuestions(pendingQuestions.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Interface Admin</h1>
            <p className="text-muted-foreground">Validation des questions générées par IA</p>
          </div>
          <CyberButton variant="secondary" size="lg">
            <Sparkles className="h-5 w-5 mr-2" />
            Générer nouvelles questions
          </CyberButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">En attente</p>
                <p className="text-3xl font-bold text-primary">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Validées</p>
                <p className="text-3xl font-bold text-secondary">{stats.validated}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-secondary" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Refusées</p>
                <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </div>

        {/* Pending Questions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Questions en attente de validation</h2>
          
          {pendingQuestions.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-secondary" />
              <p className="text-xl text-muted-foreground">
                Toutes les questions ont été traitées !
              </p>
            </div>
          ) : (
            pendingQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-primary border-primary">
                        {question.category}
                      </Badge>
                      {question.aiGenerated && (
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="h-3 w-3" />
                          IA
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-medium mb-2">{question.question}</p>
                    <p className="text-sm text-muted-foreground">
                      Réponse correcte : <span className="font-semibold text-foreground">
                        {question.answer ? "OUI" : "NON"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CyberButton
                    variant="correct"
                    onClick={() => handleValidate(question.id)}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Valider
                  </CyberButton>
                  <CyberButton
                    variant="incorrect"
                    onClick={() => handleReject(question.id)}
                    className="flex-1"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Rejeter
                  </CyberButton>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
