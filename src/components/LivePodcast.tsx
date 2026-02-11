import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Send, Radio, Volume2, Pause, Play, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NewsArticle } from "@/data/newsData";

interface PodcastLine {
  id: string;
  speaker: "host" | "expert" | "audience";
  name: string;
  content: string;
}

const generatePodcastScript = (article: NewsArticle): PodcastLine[] => [
  {
    id: "1",
    speaker: "host",
    name: "Alex Chen (Host)",
    content: `Welcome to NewsDeep Dive! Today we're breaking down a major story: "${article.title}". I'm your host Alex Chen, and joining me is our subject matter expert.`,
  },
  {
    id: "2",
    speaker: "expert",
    name: `Dr. Sarah Webb (${article.category} Expert)`,
    content: `Thanks Alex! This is really a fascinating development. The key thing people need to understand is that ${article.excerpt.toLowerCase()}`,
  },
  {
    id: "3",
    speaker: "host",
    name: "Alex Chen (Host)",
    content: "Can you break down the main implications for our audience? What should people be paying attention to?",
  },
  {
    id: "4",
    speaker: "expert",
    name: `Dr. Sarah Webb (${article.category} Expert)`,
    content: `Absolutely. There are three major takeaways here. First, the immediate impact on stakeholders in the ${article.category.toLowerCase()} sector is significant. Second, we're seeing a shift in how policy makers approach these issues. And third, the long-term ripple effects could reshape the landscape entirely.`,
  },
  {
    id: "5",
    speaker: "host",
    name: "Alex Chen (Host)",
    content: "That's really insightful. Now, some of our listeners might be wondering about the practical implications for everyday people. How does this affect the average person?",
  },
  {
    id: "6",
    speaker: "expert",
    name: `Dr. Sarah Webb (${article.category} Expert)`,
    content: "Great question. On a day-to-day basis, people might not feel the effects immediately. But over the next 6 to 12 months, we'll likely see changes in how related services and products are offered. It's something everyone should keep an eye on.",
  },
  {
    id: "7",
    speaker: "host",
    name: "Alex Chen (Host)",
    content: "Let's also talk about the controversy around this. Not everyone agrees with the direction things are heading. What are the main counterarguments?",
  },
  {
    id: "8",
    speaker: "expert",
    name: `Dr. Sarah Webb (${article.category} Expert)`,
    content: "The critics raise some valid points. There are concerns about implementation feasibility, economic costs, and whether the timeline is realistic. However, the data largely supports the approach being taken, with some caveats.",
  },
  {
    id: "9",
    speaker: "host",
    name: "Alex Chen (Host)",
    content: "We're now opening the floor to audience questions. If you have a question about this topic, feel free to ask below!",
  },
];

interface LivePodcastProps {
  article: NewsArticle;
}

const LivePodcast = ({ article }: LivePodcastProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleLines, setVisibleLines] = useState<PodcastLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audienceQuestion, setAudienceQuestion] = useState("");
  const [audienceMessages, setAudienceMessages] = useState<PodcastLine[]>([]);
  const [liveListeners] = useState(Math.floor(Math.random() * 200) + 50);
  const scrollRef = useRef<HTMLDivElement>(null);
  const script = useRef(generatePodcastScript(article)).current;

  // Auto-play podcast lines
  useEffect(() => {
    if (!isPlaying || currentIndex >= script.length) return;

    const timer = setTimeout(() => {
      setVisibleLines((prev) => [...prev, script[currentIndex]]);
      setCurrentIndex((i) => i + 1);
    }, 3000 + Math.random() * 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, script]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines, audienceMessages]);

  const handleStart = () => {
    setIsPlaying(true);
    if (visibleLines.length === 0 && currentIndex === 0) {
      setVisibleLines([script[0]]);
      setCurrentIndex(1);
    }
  };

  const handleAudienceAsk = () => {
    if (!audienceQuestion.trim()) return;
    const q: PodcastLine = {
      id: `aud-${Date.now()}`,
      speaker: "audience",
      name: "You (Audience)",
      content: audienceQuestion,
    };
    setAudienceMessages((prev) => [...prev, q]);
    setAudienceQuestion("");

    // Simulated expert response
    setTimeout(() => {
      const response: PodcastLine = {
        id: `resp-${Date.now()}`,
        speaker: "expert",
        name: `Dr. Sarah Webb (${article.category} Expert)`,
        content: `That's a great audience question! Regarding "${audienceQuestion.slice(0, 40)}..." — based on the current evidence and trends in ${article.category.toLowerCase()}, I'd say we need to look at multiple factors. The short answer is that this development will have cascading effects, and staying informed is key.`,
      };
      setAudienceMessages((prev) => [...prev, response]);
    }, 2500);
  };

  const allLines = [...visibleLines, ...audienceMessages];

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case "host": return "bg-blue-500";
      case "expert": return "bg-emerald-500";
      case "audience": return "bg-primary";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
        variant="outline"
      >
        <Radio className="w-4 h-4" />
        Join Live Podcast
        <Badge variant="destructive" className="ml-1 text-xs animate-pulse">
          LIVE
        </Badge>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
              style={{ height: "80vh", maxHeight: 700 }}
            >
              {/* Header */}
              <div className="bg-foreground text-background px-5 py-4 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                      <Radio className="w-5 h-5" />
                      NewsDeep Dive — Live Podcast
                    </h3>
                    <p className="text-xs opacity-70 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> {liveListeners} listening
                      </span>
                      <Badge variant="destructive" className="text-[10px] h-4 animate-pulse">
                        🔴 LIVE
                      </Badge>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-background hover:bg-background/20 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Speakers Bar */}
              <div className="flex items-center gap-4 px-5 py-3 bg-muted/50 border-b shrink-0">
                <div className="flex items-center gap-2">
                  <Avatar className="w-9 h-9 ring-2 ring-blue-500">
                    <AvatarFallback className="bg-blue-500 text-white text-xs">AC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold">Alex Chen</p>
                    <p className="text-[10px] text-muted-foreground">Host</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-9 h-9 ring-2 ring-emerald-500">
                    <AvatarFallback className="bg-emerald-500 text-white text-xs">SW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold">Dr. Sarah Webb</p>
                    <p className="text-[10px] text-muted-foreground">{article.category} Expert</p>
                  </div>
                </div>

                <div className="ml-auto">
                  {!isPlaying ? (
                    <Button size="sm" onClick={handleStart} className="gap-1.5">
                      <Play className="w-3.5 h-3.5" /> Start
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsPlaying(false)}
                      className="gap-1.5"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </Button>
                  )}
                </div>
              </div>

              {/* Transcript / Chat */}
              <ScrollArea className="flex-1 p-5" ref={scrollRef}>
                {allLines.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center py-12">
                    <Mic className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">Podcast is ready</p>
                    <p className="text-xs mt-1">Press Start to begin the live discussion</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allLines.map((line) => (
                      <motion.div
                        key={line.id}
                        initial={{ opacity: 0, x: line.speaker === "audience" ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3"
                      >
                        <Avatar className={`w-8 h-8 shrink-0 ring-2 ${
                          line.speaker === "host" ? "ring-blue-500" :
                          line.speaker === "expert" ? "ring-emerald-500" : "ring-primary"
                        }`}>
                          <AvatarFallback className={`text-xs text-white ${getSpeakerColor(line.speaker)}`}>
                            {line.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-xs font-semibold mb-0.5 flex items-center gap-2">
                            {line.name}
                            {line.speaker === "audience" && (
                              <Badge variant="outline" className="text-[10px] h-4">
                                <Hand className="w-2.5 h-2.5 mr-0.5" /> Question
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{line.content}</p>
                        </div>
                      </motion.div>
                    ))}

                    {isPlaying && currentIndex < script.length && (
                      <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                        Speaking...
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Audience Q&A */}
              <div className="border-t p-4 bg-muted/30 shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">
                  Audience Q&A
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAudienceAsk();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={audienceQuestion}
                    onChange={(e) => setAudienceQuestion(e.target.value)}
                    placeholder="Ask the expert a question..."
                    className="flex-1 text-sm"
                  />
                  <Button type="submit" size="icon" disabled={!audienceQuestion.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LivePodcast;
