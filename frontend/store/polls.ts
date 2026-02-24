import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Poll } from "@/lib/api";

type PollState = {
  polls: Poll[];
  votedPolls: Record<string, string>; // pollId -> selectedOptionId
  rotationStartTime: number; // epoch ms — persisted so timer doesn't reset

  setPolls: (polls: Poll[]) => void;
  updatePollVotes: (pollId: string, votes: Record<string, number>) => void;
  markVoted: (pollId: string, optionId: string) => void;
  hasVoted: (pollId: string) => boolean;
  getSelectedOption: (pollId: string) => string | null;
  getRotationStart: () => number;
};

export const usePollStore = create<PollState>()(
  persist(
    (set, get) => ({
      polls: [],
      votedPolls: {},
      rotationStartTime: Date.now(),

      setPolls: (polls) => set((state) => {
        // Only set rotationStartTime if it hasn't been set yet
        const start = state.rotationStartTime || Date.now();
        return { polls, rotationStartTime: start };
      }),

      updatePollVotes: (pollId, votes) =>
        set((state) => ({
          polls: state.polls.map((poll) => {
            if (poll.id !== pollId) return poll;
            return {
              ...poll,
              options: poll.options.map((opt) => ({
                ...opt,
                vote_count: votes[opt.id] ?? opt.vote_count,
              })),
            };
          }),
        })),

      markVoted: (pollId, optionId) =>
        set((state) => ({
          votedPolls: { ...state.votedPolls, [pollId]: optionId },
        })),

      hasVoted: (pollId) => pollId in get().votedPolls,
      getSelectedOption: (pollId) => get().votedPolls[pollId] ?? null,
      getRotationStart: () => get().rotationStartTime,
    }),
    {
      name: "event-polls",
      // Persist votedPolls and rotationStartTime so they survive page navigations
      partialize: (state) => ({
        votedPolls: state.votedPolls,
        rotationStartTime: state.rotationStartTime,
      }),
    }
  )
);
