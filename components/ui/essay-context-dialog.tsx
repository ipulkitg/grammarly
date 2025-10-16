import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { PencilIcon, PlusIcon, XIcon } from "lucide-react";

interface EssayMetadata {
  program: string;
  wordLimit: number;
  deadline: string;
  goals: {
    short: string;
    long: string;
  };
  motivator: string;
  programFitReasons: Array<{
    aspect: string;
    reason: string;
  }>;
  anecdotes: Array<{
    story: string;
    purpose: string;
  }>;
  keywords: string[];
  obstacles: Array<{
    description: string;
    resolution: string;
  }>;
}

interface EssayContextDialogProps {
  metadata: Partial<EssayMetadata>;
  onSave: (metadata: EssayMetadata) => void;
  children?: React.ReactNode;
}

export function EssayContextDialog({ metadata = {}, onSave, children }: EssayContextDialogProps) {
  const [formData, setFormData] = useState<EssayMetadata>({
    program: metadata.program || "",
    wordLimit: metadata.wordLimit || 750,
    deadline: metadata.deadline || "",
    goals: metadata.goals || { short: "", long: "" },
    motivator: metadata.motivator || "",
    programFitReasons: metadata.programFitReasons || [],
    anecdotes: metadata.anecdotes || [],
    keywords: metadata.keywords || [],
    obstacles: metadata.obstacles || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addProgramFitReason = () => {
    setFormData({
      ...formData,
      programFitReasons: [...formData.programFitReasons, { aspect: "", reason: "" }]
    });
  };

  const addAnecdote = () => {
    setFormData({
      ...formData,
      anecdotes: [...formData.anecdotes, { story: "", purpose: "" }]
    });
  };

  const addObstacle = () => {
    setFormData({
      ...formData,
      obstacles: [...formData.obstacles, { description: "", resolution: "" }]
    });
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keyword]
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <PencilIcon className="h-4 w-4" />
            Essay Context
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Essay Context</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Target Program + School</Label>
              <Input
                id="program"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                placeholder="e.g., MS CS · Stanford"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wordLimit">Word Limit</Label>
              <Input
                id="wordLimit"
                type="number"
                value={formData.wordLimit}
                onChange={(e) => setFormData({ ...formData, wordLimit: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shortGoal">Immediate Goal After Graduation</Label>
              <Input
                id="shortGoal"
                value={formData.goals.short}
                onChange={(e) => setFormData({
                  ...formData,
                  goals: { ...formData.goals, short: e.target.value }
                })}
                placeholder="e.g., Join AI startup"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longGoal">10-year Vision</Label>
              <Input
                id="longGoal"
                value={formData.goals.long}
                onChange={(e) => setFormData({
                  ...formData,
                  goals: { ...formData.goals, long: e.target.value }
                })}
                placeholder="e.g., Lead ethical-AI lab"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivator">What sparked your interest in this field?</Label>
            <Input
              id="motivator"
              value={formData.motivator}
              onChange={(e) => setFormData({ ...formData, motivator: e.target.value })}
              placeholder="e.g., Robotics club win in HS sparked my love for AI"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Program Fit Reasons</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProgramFitReason}>
                <PlusIcon className="h-4 w-4" />
                Add Reason
              </Button>
            </div>
            {formData.programFitReasons.map((reason, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Aspect"
                  value={reason.aspect}
                  onChange={(e) => {
                    const newReasons = [...formData.programFitReasons];
                    newReasons[index].aspect = e.target.value;
                    setFormData({ ...formData, programFitReasons: newReasons });
                  }}
                />
                <Input
                  placeholder="Reason"
                  value={reason.reason}
                  onChange={(e) => {
                    const newReasons = [...formData.programFitReasons];
                    newReasons[index].reason = e.target.value;
                    setFormData({ ...formData, programFitReasons: newReasons });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Anecdotes (Optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAnecdote}>
                <PlusIcon className="h-4 w-4" />
                Add Story
              </Button>
            </div>
            {formData.anecdotes.map((anecdote, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Story"
                  value={anecdote.story}
                  onChange={(e) => {
                    const newAnecdotes = [...formData.anecdotes];
                    newAnecdotes[index].story = e.target.value;
                    setFormData({ ...formData, anecdotes: newAnecdotes });
                  }}
                />
                <Input
                  placeholder="Purpose"
                  value={anecdote.purpose}
                  onChange={(e) => {
                    const newAnecdotes = [...formData.anecdotes];
                    newAnecdotes[index].purpose = e.target.value;
                    setFormData({ ...formData, anecdotes: newAnecdotes });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Keywords (Institution Buzz-words)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addKeyword((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keywords.map((keyword, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
                  <span>{keyword}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newKeywords = formData.keywords.filter((_, i) => i !== index);
                      setFormData({ ...formData, keywords: newKeywords });
                    }}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Obstacles</Label>
              <Button type="button" variant="outline" size="sm" onClick={addObstacle}>
                <PlusIcon className="h-4 w-4" />
                Add Obstacle
              </Button>
            </div>
            {formData.obstacles.map((obstacle, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Description"
                  value={obstacle.description}
                  onChange={(e) => {
                    const newObstacles = [...formData.obstacles];
                    newObstacles[index].description = e.target.value;
                    setFormData({ ...formData, obstacles: newObstacles });
                  }}
                />
                <Input
                  placeholder="Resolution"
                  value={obstacle.resolution}
                  onChange={(e) => {
                    const newObstacles = [...formData.obstacles];
                    newObstacles[index].resolution = e.target.value;
                    setFormData({ ...formData, obstacles: newObstacles });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <DialogClose asChild>
              <Button type="submit">Save Context</Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 