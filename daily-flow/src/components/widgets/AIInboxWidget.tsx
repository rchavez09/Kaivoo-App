import { Sparkles, Send, Check, X, Globe, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAIInboxState } from './useAIInboxState';
import ThoughtSuggestionCard from './ThoughtSuggestionCard';
import LinkCaptureResult from './LinkCaptureResult';
import AIActionHistory from './AIActionHistory';

export default function AIInboxWidget() {
  const state = useAIInboxState();

  return (
    <Card className="border-primary/20" aria-live="polite">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Inbox
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={state.activeTab} onValueChange={(v) => state.setActiveTab(v as 'thought' | 'link')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="thought" className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              Quick Thought
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <Globe className="h-3.5 w-3.5" />
              Link
            </TabsTrigger>
          </TabsList>

          {/* Quick Thought Tab */}
          <TabsContent value="thought" className="space-y-4 mt-4">
            {/* Input area */}
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="Type a thought, paste a link, and AI will suggest tasks, notes, and routing..."
                  value={state.input}
                  onChange={(e) => state.setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) state.handleSubmit();
                  }}
                  className="min-h-[80px] pr-12 resize-none bg-background"
                  disabled={state.isProcessing}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Send message"
                  className="absolute right-2 bottom-2"
                  onClick={state.handleSubmit}
                  disabled={!state.input.trim() || state.isProcessing}
                >
                  {state.isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Press &#8984;+Enter to send &bull; Paste any link to auto-capture
              </p>
            </div>

            {/* Clarification question */}
            {state.clarification && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                <p className="text-sm font-medium">{state.clarification.question}</p>
                <div className="flex flex-wrap gap-2">
                  {state.clarification.choices.map((choice) => (
                    <Button
                      key={choice}
                      variant="outline"
                      size="sm"
                      onClick={() => state.handleClarificationChoice(choice)}
                      disabled={state.isProcessing}
                    >
                      {choice}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={state.handleCancel}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Suggestions preview */}
            {state.suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Suggestions
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {state.suggestions.filter(s => s.selected).length} of {state.suggestions.length} selected
                  </span>
                </div>

                <div className="space-y-2">
                  {state.suggestions.map((suggestion, index) => (
                    <ThoughtSuggestionCard
                      key={index}
                      suggestion={suggestion}
                      index={index}
                      onToggle={state.toggleSuggestion}
                      onUpdate={state.updateSuggestion}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={state.handleApprove} disabled={state.isProcessing} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button variant="outline" onClick={state.handleCancel} disabled={state.isProcessing}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Link Capture Tab */}
          <TabsContent value="link" className="space-y-4 mt-4">
            {!state.linkResult && !state.needsManualInput && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Paste any website link (recipes, articles, etc.)..."
                    value={state.linkUrl}
                    onChange={(e) => state.setLinkUrl(e.target.value)}
                    disabled={state.isProcessing}
                    className="bg-background"
                  />
                  <Input
                    placeholder="Optional: Add context (e.g., 'pasta recipe', 'save for later')"
                    value={state.linkInstruction}
                    onChange={(e) => state.setLinkInstruction(e.target.value)}
                    disabled={state.isProcessing}
                    className="bg-background"
                  />
                </div>
                <Button
                  onClick={state.handleLinkSubmit}
                  disabled={!state.linkUrl.trim() || state.isProcessing}
                  className="w-full"
                >
                  {state.isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting content...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Capture Link
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  AI will scrape the page and create a structured note with topics &amp; tags
                </p>
              </div>
            )}

            {/* Manual input fallback */}
            {state.needsManualInput && !state.linkResult && (
              <div className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Couldn&apos;t access this page. Please paste the content manually.
                  </AlertDescription>
                </Alert>
                <Textarea
                  placeholder="Paste the page content here..."
                  value={state.manualContent}
                  onChange={(e) => state.setManualContent(e.target.value)}
                  className="min-h-[120px] bg-background"
                  disabled={state.isProcessing}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={state.handleLinkSubmit}
                    disabled={!state.manualContent.trim() || state.isProcessing}
                    className="flex-1"
                  >
                    {state.isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Process Content
                  </Button>
                  <Button variant="outline" onClick={state.handleCancelLink}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Link result preview */}
            {state.linkResult && state.editedNote && (
              <LinkCaptureResult
                linkResult={state.linkResult}
                editedNote={state.editedNote}
                linkTasks={state.linkTasks}
                isProcessing={state.isProcessing}
                onEditNote={state.setEditedNote}
                onToggleLinkTask={state.toggleLinkTask}
                onApprove={state.handleApproveLinkCapture}
                onCancel={state.handleCancelLink}
              />
            )}
          </TabsContent>
        </Tabs>

        <AIActionHistory
          logs={state.recentLogs}
          showHistory={state.showHistory}
          onToggleHistory={state.setShowHistory}
          onUndo={state.undoAction}
        />
      </CardContent>
    </Card>
  );
}
