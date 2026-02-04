import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NewsArticle, newsArticles } from "@/data/newsData";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  initialArticle?: NewsArticle | null;
  onClearArticle?: () => void;
}

const Chatbot = ({ initialArticle, onClearArticle }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialArticle && isOpen) {
      handleArticleContext(initialArticle);
      onClearArticle?.();
    }
  }, [initialArticle, isOpen]);

  useEffect(() => {
    if (initialArticle) {
      setIsOpen(true);
    }
  }, [initialArticle]);

  const generateResponse = async (userMessage: string, context?: NewsArticle) => {
    setIsLoading(true);

    // Simulate AI response (in production, this would call the Lovable AI Gateway)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let response = "";

    // Check if user is asking about a specific article
    if (context) {
      response = generateArticleResponse(context, userMessage);
    } else if (userMessage.toLowerCase().includes("summary") || userMessage.toLowerCase().includes("summarize")) {
      response = generateSummaryResponse(userMessage);
    } else if (userMessage.toLowerCase().includes("find") || userMessage.toLowerCase().includes("search") || userMessage.toLowerCase().includes("about")) {
      response = generateSearchResponse(userMessage);
    } else if (userMessage.toLowerCase().includes("question") || userMessage.toLowerCase().includes("related")) {
      response = generateQuestionsResponse(userMessage);
    } else {
      response = generateGeneralResponse(userMessage);
    }

    setIsLoading(false);
    return response;
  };

  const generateArticleResponse = (article: NewsArticle, query: string) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("summary") || lowerQuery.includes("about")) {
      return `## Summary: ${article.title}\n\n${article.excerpt}\n\n**Key Points:**\n- Category: ${article.category}\n- Author: ${article.author}\n- Reading time: ${article.readTime} minutes\n\nWould you like me to suggest related questions or find similar articles?`;
    }
    
    if (lowerQuery.includes("question")) {
      return `## Related Questions for "${article.title}"\n\n1. What are the broader implications of this ${article.category.toLowerCase()} story?\n2. How does this compare to similar events in recent history?\n3. What reactions have key stakeholders expressed?\n4. What might be the long-term effects of this development?\n5. Are there any opposing viewpoints on this matter?\n\nClick any question to explore further!`;
    }

    return `I can help you understand this article better!\n\n**"${article.title}"**\n\n${article.excerpt}\n\n*Ask me for a summary, related questions, or to find similar articles.*`;
  };

  const generateSummaryResponse = (query: string) => {
    const relevantArticle = newsArticles[0];
    return `## Today's Top Story Summary\n\n**${relevantArticle.title}**\n\n${relevantArticle.excerpt}\n\n---\n\n*${relevantArticle.author} • ${relevantArticle.publishedAt}*\n\nWould you like me to summarize another article or suggest related reading?`;
  };

  const generateSearchResponse = (query: string) => {
    const keywords = query.toLowerCase().split(" ").filter(w => w.length > 3);
    const matches = newsArticles.filter(article => 
      keywords.some(kw => 
        article.title.toLowerCase().includes(kw) || 
        article.category.toLowerCase().includes(kw) ||
        article.content.toLowerCase().includes(kw)
      )
    ).slice(0, 3);

    if (matches.length > 0) {
      let response = `## Found ${matches.length} relevant article${matches.length > 1 ? 's' : ''}:\n\n`;
      matches.forEach((article, i) => {
        response += `**${i + 1}. ${article.title}**\n*${article.category} • ${article.publishedAt}*\n\n`;
      });
      response += "\nClick on any article in the main feed to read more, or ask me to summarize any of these!";
      return response;
    }

    return `I couldn't find articles matching your query. Try searching for topics like:\n\n- **Climate** - Environmental news\n- **Technology** - Tech industry updates\n- **Sports** - Latest game results\n- **Business** - Market and economy news\n\nOr browse the categories above!`;
  };

  const generateQuestionsResponse = (query: string) => {
    return `## Explore Today's News\n\nHere are some thought-provoking questions about current events:\n\n1. **Climate Summit** - What will the new carbon reduction targets mean for everyday consumers?\n\n2. **Tech Regulation** - How might antitrust laws change the apps we use daily?\n\n3. **Federal Reserve** - What do rate cuts mean for homebuyers and investors?\n\n4. **Space Exploration** - What's next after the Mars landing success?\n\nAsk me about any of these topics!`;
  };

  const generateGeneralResponse = (query: string) => {
    return `👋 Hello! I'm your **News Assistant**.\n\nI can help you:\n\n- 📰 **Summarize articles** - Get quick overviews of any story\n- ❓ **Generate questions** - Explore topics deeper\n- 🔍 **Find relevant news** - Search across all categories\n- 💡 **Explain context** - Understand complex stories\n\n*Try asking:*\n- "Summarize today's top story"\n- "Find articles about technology"\n- "What questions should I ask about climate?"\n\nOr click **"Ask AI about this"** on any article!`;
  };

  const handleArticleContext = async (article: NewsArticle) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Tell me about this article: "${article.title}"`,
    };
    setMessages((prev) => [...prev, userMessage]);

    const response = await generateResponse(userMessage.content, article);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const response = await generateResponse(input);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
            className="chatbot-window mb-4"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">News Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
                  <p className="font-medium">Welcome to News Assistant!</p>
                  <p className="text-sm mt-2">
                    Ask me to summarize articles, find news, or generate discussion questions.
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === "user" ? "chatbot-message-user" : "chatbot-message-bot"}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none text-sm">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="chatbot-message-bot">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-chatbot-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the news..."
                  className="flex-1 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-fab"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
};

export default Chatbot;
