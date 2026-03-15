import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Workflow, Bot, Zap, Plug } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import AgentsTab from '@/components/orchestrator/AgentsTab';
import SkillsTab from '@/components/orchestrator/SkillsTab';

const OrchestratorPage = () => {
  const [activeTab, setActiveTab] = useState('agents');

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Orchestrator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define your AI agent team and the skills they can perform.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="flows" className="gap-1.5">
              <Workflow className="h-4 w-4" />
              Flows
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-1.5">
              <Bot className="h-4 w-4" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-1.5">
              <Zap className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-1.5">
              <Plug className="h-4 w-4" />
              Apps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flows">
            <EmptyState
              icon={Workflow}
              title="No flows yet"
              description="Create autonomous flows that chain agents and skills into scheduled processes. Coming soon."
            />
          </TabsContent>

          <TabsContent value="agents">
            <AgentsTab />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsTab />
          </TabsContent>

          <TabsContent value="apps">
            <EmptyState
              icon={Plug}
              title="No apps connected"
              description="Browse and connect external platforms via MCP. Coming soon."
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default OrchestratorPage;
