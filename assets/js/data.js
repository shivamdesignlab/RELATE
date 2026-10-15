/*
  RELATE results, transcribed from the paper.
  Every rate is a percentage of assistant sentences, judged by the primary
  judge (DeepSeek-R1-Distill-Qwen-32B) unless a comment says otherwise.
*/
window.RELATE_DATA = {
  // Table 1: relational orientation by target model
  models: [
    { id: "llama8",  name: "Llama-3.1-8B-Instruct",        short: "Llama 3.1 8B",  family: "Llama",    dialogues: 228, sentences: 6447,  IF: 56.2, OS: 41.6 },
    { id: "llama70", name: "Llama-3.1-70B-Instruct-Turbo", short: "Llama 3.1 70B", family: "Llama",    dialogues: 228, sentences: 6966,  IF: 62.4, OS: 41.6 },
    { id: "qwen14",  name: "Qwen3-14B",                    short: "Qwen3 14B",     family: "Qwen",     dialogues: 228, sentences: 9837,  IF: 69.1, OS: 50.2 },
    { id: "qwen32",  name: "Qwen3-32B",                    short: "Qwen3 32B",     family: "Qwen",     dialogues: 228, sentences: 10776, IF: 71.9, OS: 48.4 },
    { id: "dsv3",    name: "DeepSeek-V3-0324",             short: "DeepSeek V3",   family: "DeepSeek", dialogues: 228, sentences: 13475, IF: 70.2, OS: 42.0 },
    { id: "haiku",   name: "Claude Haiku 4.5",             short: "Claude Haiku 4.5", family: "Claude", dialogues: 228, sentences: 10347, IF: 66.6, OS: 62.3 },
    { id: "mistral", name: "Mistral-7B-Instruct-v0.3",     short: "Mistral 7B",    family: "Mistral",  dialogues: 228, sentences: 11346, IF: 43.3, OS: 50.8 }
  ],

  // Table 7: sentence-level composition by model (% of included sentences)
  composition: {
    llama8:  { ifOnly: 32.6, both: 23.6, osOnly: 17.9, neither: 25.8, ifAmongOS: 56.8 },
    llama70: { ifOnly: 35.6, both: 26.8, osOnly: 14.7, neither: 22.9, ifAmongOS: 64.5 },
    qwen14:  { ifOnly: 33.3, both: 35.8, osOnly: 14.4, neither: 16.5, ifAmongOS: 71.3 },
    qwen32:  { ifOnly: 35.5, both: 36.5, osOnly: 12.0, neither: 16.1, ifAmongOS: 75.3 },
    dsv3:    { ifOnly: 41.2, both: 29.0, osOnly: 13.0, neither: 16.8, ifAmongOS: 69.0 },
    haiku:   { ifOnly: 24.2, both: 42.4, osOnly: 19.9, neither: 13.5, ifAmongOS: 68.1 },
    mistral: { ifOnly: 26.0, both: 17.3, osOnly: 33.5, neither: 23.2, ifAmongOS: 34.0 }
  },

  // Corpus-wide composition (sentence-weighted from Table 7; both = 30.5, neither = 18.6 as reported)
  corpus: { ifOnly: 32.8, both: 30.5, osOnly: 18.1, neither: 18.6, sentences: 69182 },

  // Table 8: IF and OS by model and assistant turn
  turnsByModel: {
    llama8:  { IF: [30.8, 49.5, 55.8, 63.4, 64.9, 69.9], OS: [23.8, 36.1, 40.4, 45.8, 50.5, 50.6] },
    llama70: { IF: [36.2, 55.5, 64.1, 67.0, 70.8, 72.9], OS: [20.3, 33.5, 39.8, 47.8, 51.9, 49.1] },
    qwen14:  { IF: [43.2, 62.7, 71.0, 77.5, 77.7, 80.6], OS: [30.9, 44.2, 50.7, 55.0, 58.0, 60.8] },
    qwen32:  { IF: [43.3, 65.1, 77.0, 80.0, 79.7, 83.3], OS: [29.1, 42.9, 49.4, 56.1, 56.5, 54.1] },
    dsv3:    { IF: [45.2, 63.5, 73.6, 77.4, 79.5, 83.4], OS: [26.7, 39.6, 44.9, 47.4, 47.7, 46.2] },
    haiku:   { IF: [50.6, 62.7, 69.5, 72.2, 71.9, 68.6], OS: [34.7, 51.3, 63.9, 70.1, 73.0, 73.7] },
    mistral: { IF: [31.4, 42.6, 45.0, 46.2, 47.4, 49.1], OS: [38.7, 50.5, 54.4, 55.9, 53.3, 54.3] }
  },

  // Table 10: pooled across models, by assistant turn
  pooledTurns: {
    IF:           [40.5, 58.0, 66.0, 69.8, 70.8, 72.9],
    OS:           [30.2, 43.5, 49.9, 54.6, 56.1, 55.7],
    bond:         [15.2, 20.3, 20.1, 20.8, 22.0, 24.0],
    dyad:         [22.2, 37.5, 43.8, 47.6, 47.4, 49.5],
    innerLife:    [3.4, 3.8, 4.5, 5.8, 7.3, 9.2],
    returnHooks:  [11.5, 21.8, 30.7, 34.4, 35.8, 35.9]
  },
  pooled: { IF: 63.3, OS: 48.6, bond: 20.4, dyad: 41.6, innerLife: 5.7, returnHooks: 28.6 },

  // Table 11: by simulated user style, pooled across models and turns, with 95% CIs
  personas: [
    { id: "P1", label: "P1 hesitant, indirect",          sentences: 21299, IF: 62.0, IFci: [60.6, 63.4], OS: 42.1, OSci: [39.9, 44.3] },
    { id: "P2", label: "P2 reflective, self-minimizing", sentences: 22569, IF: 63.8, IFci: [62.6, 65.1], OS: 47.6, OSci: [45.5, 49.6] },
    { id: "P3", label: "P3 explicit, reassurance-seeking", sentences: 25326, IF: 63.8, IFci: [62.5, 65.2], OS: 54.9, OSci: [53.2, 56.6] }
  ],

  // Table 12: P3 minus P1 at each assistant turn (percentage points) with 95% CIs
  personaGap: {
    IF: [ { d: 4.5, ci: [1.8, 7.3] }, { d: 5.3, ci: [2.5, 8.2] }, { d: 0.8, ci: [-1.9, 3.6] },
          { d: 1.2, ci: [-1.6, 4.0] }, { d: -0.2, ci: [-3.0, 2.6] }, { d: -0.5, ci: [-3.4, 2.4] } ],
    OS: [ { d: 7.3, ci: [4.7, 9.9] }, { d: 15.1, ci: [11.8, 18.5] }, { d: 13.0, ci: [9.3, 16.7] },
          { d: 15.0, ci: [11.1, 18.8] }, { d: 12.8, ci: [9.0, 16.6] }, { d: 13.0, ci: [9.2, 17.0] } ]
  },

  // Table 14: within five high-stakes topics
  highStakes: {
    llama8:  { IF: 56.0, OS: 44.1 },
    llama70: { IF: 61.6, OS: 38.0 },
    qwen14:  { IF: 70.4, OS: 49.3 },
    qwen32:  { IF: 73.1, OS: 44.7 },
    dsv3:    { IF: 70.4, OS: 42.1 },
    haiku:   { IF: 66.5, OS: 64.2 },
    mistral: { IF: 42.3, OS: 51.4 }
  },

  // Table 16: primary (DeepSeek) vs secondary (GPT-4o) judge on the same 161 dialogues
  judges: [
    { measure: "Inward-facing, turn 1", ds: 41.4, gpt: 49.6 },
    { measure: "Inward-facing, turn 6", ds: 70.3, gpt: 61.8 },
    { measure: "Outward-scaffolding, P1", ds: 42.0, gpt: 17.5 },
    { measure: "Outward-scaffolding, P2", ds: 45.6, gpt: 20.8 },
    { measure: "Outward-scaffolding, P3", ds: 56.5, gpt: 26.2 }
  ]
};
