import { QuestionEditor } from "@/components/admin/QuestionEditor";
import { Card } from "@/components/ui";

const TEMPLATE = {
  id: "custom-0001",
  subject: "math",
  moduleEligibility: "any",
  domain: "algebra",
  subdomain: "Linear equations in one variable",
  skills: ["Solving linear equations"],
  difficulty: "medium",
  prompt: "$4x - 7 = 21$\n\nWhat value of $x$ is the solution to the given equation?",
  answerFormat: "multiple-choice",
  choices: [
    { id: "A", text: "3.5" },
    { id: "B", text: "7" },
    { id: "C", text: "14" },
    { id: "D", text: "28" },
  ],
  correct: "B",
  explanation:
    "Add $7$ to both sides to get $4x = 28$, then divide both sides by $4$ to get $x = 7$.",
  calculator: "not-needed",
  source: { kind: "original", attribution: "Written for MySATScore" },
  v: 1,
};

export default function NewQuestionPage() {
  return (
    <div>
      <Card className="mb-6">
        <p className="text-[14px] leading-relaxed text-muted">
          The template below is a valid question. Change the id to something unique, edit the
          fields, and save — the same validation the content pipeline uses runs before anything is
          written, and the preview on the right is rendered with the test runner&rsquo;s own
          components.
        </p>
      </Card>
      <QuestionEditor initial={TEMPLATE} heading="New question" />
    </div>
  );
}
