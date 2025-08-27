import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Sparkles, BookOpen, Brain, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeInput } from "@/components/CodeInput";
import { ExplanationResults } from "@/components/ExplanationResults";
import { useToast } from "@/components/ui/use-toast";
import { getAllSamples } from "@/lib/sampleCodes";

const SUPPORTED_LANGUAGES = [
  { id: "auto", name: "Auto-detect", icon: "🔍" },
  { id: "javascript", name: "JavaScript", icon: "🟨" },
  { id: "typescript", name: "TypeScript", icon: "🔷" },
  { id: "python", name: "Python", icon: "🐍" },
  { id: "java", name: "Java", icon: "☕" },
  { id: "cpp", name: "C++", icon: "⚙️" },
  { id: "go", name: "Go", icon: "🐹" },
  { id: "sql", name: "SQL", icon: "🗄️" },
  { id: "html", name: "HTML", icon: "🌐" },
  { id: "css", name: "CSS", icon: "🎨" }
];

const READING_LEVELS = [
  { id: "12", name: "Explain like I'm 12", description: "Simple terms, everyday analogies" },
  { id: "15", name: "High School Level", description: "Clear but more technical" },
  { id: "cs1", name: "CS Student", description: "Computer science terminology" },
  { id: "pro", name: "Professional", description: "Advanced concepts and details" }
];

const SAMPLE_CODES = getAllSamples();

const Index = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("auto");
  const [readingLevel, setReadingLevel] = useState("15");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const { toast } = useToast();

  const handleExplain = async () => {
    if (!code.trim()) {
      toast({
        title: "No code provided",
        description: "Please paste some code to explain.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://bsndnraokqpuwvqzxtcu.supabase.co/functions/v1/explain-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          language: language,
          level: readingLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
      
      toast({
        title: "Code explained successfully!",
        description: "Check out the explanation, diagram, and quiz below.",
      });

    } catch (error) {
      console.error('Explanation error:', error);
      toast({
        title: "Explanation failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_CODES[0]) => {
    setCode(sample.code);
    setLanguage(sample.language);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Code2 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                CodeQuest
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Paste any code and get clear explanations, visual diagrams, and interactive quizzes.
              Perfect for beginners learning to code!
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span>AI-Powered Explanations</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <span>Visual Flowcharts</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                <span>Interactive Quizzes</span>
              </div>
            </div>
          </motion.div>

          {/* Main Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-2 block">Language</label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_LANGUAGES.map(lang => (
                              <SelectItem key={lang.id} value={lang.id}>
                                {lang.icon} {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium mb-2 block">Explanation Level</label>
                        <Select value={readingLevel} onValueChange={setReadingLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {READING_LEVELS.map(level => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Code Input */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Code</label>
                      <CodeInput
                        value={code}
                        onChange={setCode}
                        language={language === "auto" ? "javascript" : language}
                        placeholder="Paste your code here..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button 
                        onClick={handleExplain}
                        disabled={isLoading}
                        className="gradient-button flex-1 md:flex-none"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Explain Code
                          </>
                        )}
                      </Button>
                      
                      <Button variant="outline" size="lg">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Samples Section */}
            <div>
              <Card className="h-full">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Try Sample Code
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {SAMPLE_CODES.slice(0, 8).map((sample, index) => (
                      <button
                        key={index}
                        onClick={() => loadSample(sample)}
                        className="w-full p-3 text-left rounded-lg border hover:bg-accent/10 transition-colors"
                      >
                        <div className="font-medium text-sm">{sample.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {sample.language}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Results Section */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-12"
            >
              <ExplanationResults results={results} />
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;