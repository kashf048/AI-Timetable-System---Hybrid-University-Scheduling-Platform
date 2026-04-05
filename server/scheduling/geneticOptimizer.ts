/**
 * Genetic Algorithm Optimizer - Improves existing timetables iteratively
 * Uses selection, crossover, and mutation to find better solutions
 */

import type { ScheduleEntry, TimetableSchedule } from "./scoring";
import { calculateScore } from "./scoring";

export interface OptimizationInput {
  initialSchedule: TimetableSchedule;
  courses: Array<{
    id: number;
    instructorId: number;
    slotsPerWeek: number;
  }>;
  rooms: Array<{
    id: number;
    capacity: number;
  }>;
  timeSlots: Array<{
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
}

interface Individual {
  schedule: TimetableSchedule;
  fitness: number;
}

/**
 * Optimize timetable using Genetic Algorithm
 */
export function optimizeTimetable(
  input: OptimizationInput,
  generations: number = 50,
  populationSize: number = 20
): TimetableSchedule[] {
  // Initialize population
  let population: Individual[] = [];
  for (let i = 0; i < populationSize; i++) {
    const schedule = i === 0 ? deepCopy(input.initialSchedule) : mutateSchedule(input.initialSchedule, input);
    population.push({
      schedule,
      fitness: calculateScore(schedule, { hardConstraints: [], softConstraints: [] }).score,
    });
  }

  // Evolution loop
  for (let gen = 0; gen < generations; gen++) {
    // Sort by fitness (descending)
    population.sort((a, b) => b.fitness - a.fitness);

    // Create new generation
    const newPopulation: Individual[] = [];

    // Elitism: keep top performers
    const eliteSize = Math.ceil(populationSize * 0.1);
    for (let i = 0; i < eliteSize; i++) {
      newPopulation.push(deepCopyIndividual(population[i]));
    }

    // Generate offspring
    while (newPopulation.length < populationSize) {
      // Selection: tournament selection
      const parent1 = tournamentSelection(population);
      const parent2 = tournamentSelection(population);

      // Crossover
      let child = crossover(parent1.schedule, parent2.schedule);

      // Mutation
      if (Math.random() < 0.8) {
        child = mutateSchedule(child, input);
      }

      newPopulation.push({
        schedule: child,
        fitness: calculateScore(child, { hardConstraints: [], softConstraints: [] }).score,
      });
    }

    population = newPopulation;
  }

  // Sort and return top 3 solutions
  population.sort((a, b) => b.fitness - a.fitness);
  return population.slice(0, 3).map((ind) => ind.schedule);
}

/**
 * Tournament selection: randomly select k individuals, return best
 */
function tournamentSelection(population: Individual[], k: number = 3): Individual {
  let best = population[Math.floor(Math.random() * population.length)];
  for (let i = 1; i < k; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (candidate.fitness > best.fitness) {
      best = candidate;
    }
  }
  return best;
}

/**
 * Crossover: combine two schedules
 */
function crossover(schedule1: TimetableSchedule, schedule2: TimetableSchedule): TimetableSchedule {
  const result: TimetableSchedule = {};

  for (let day = 0; day < 7; day++) {
    result[day] = {};

    // Randomly choose from parent 1 or 2 for each day
    const source = Math.random() < 0.5 ? schedule1 : schedule2;

    if (source[day]) {
      for (const [timeSlot, entries] of Object.entries(source[day])) {
        result[day][timeSlot] = entries.map((entry) => ({ ...entry }));
      }
    }
  }

  return result;
}

/**
 * Mutation: randomly modify schedule
 */
function mutateSchedule(
  schedule: TimetableSchedule,
  input: OptimizationInput
): TimetableSchedule {
  const mutated = deepCopy(schedule);
  const mutationRate = 0.1; // 10% of entries might be mutated

  const allEntries: Array<{ day: number; timeSlot: string; index: number; entry: ScheduleEntry }> = [];

  for (let day = 0; day < 7; day++) {
    if (mutated[day]) {
      for (const [timeSlot, entries] of Object.entries(mutated[day])) {
        for (let i = 0; i < (entries as ScheduleEntry[]).length; i++) {
          allEntries.push({
            day,
            timeSlot,
            index: i,
            entry: (entries as ScheduleEntry[])[i],
          });
        }
      }
    }
  }

  // Randomly mutate some entries
  for (const item of allEntries) {
    if (Math.random() < mutationRate) {
      // Try to swap with another random time slot
      const randomDay = Math.floor(Math.random() * 7);
      const randomTimeSlot = input.timeSlots[Math.floor(Math.random() * input.timeSlots.length)];

      if (!mutated[randomDay][randomTimeSlot.id]) {
        mutated[randomDay][randomTimeSlot.id] = [];
      }

      // Move entry to new time slot
      (mutated[randomDay][randomTimeSlot.id] as ScheduleEntry[]).push(item.entry);
      (mutated[item.day][item.timeSlot] as ScheduleEntry[]).splice(item.index, 1);

      if (mutated[item.day][item.timeSlot].length === 0) {
        delete mutated[item.day][item.timeSlot];
      }
    }
  }

  return mutated;
}

/**
 * Deep copy a schedule
 */
function deepCopy(schedule: TimetableSchedule): TimetableSchedule {
  const result: TimetableSchedule = {};

  for (const [day, dayEntries] of Object.entries(schedule)) {
    result[parseInt(day)] = {};
    for (const [timeSlot, entries] of Object.entries(dayEntries)) {
      result[parseInt(day)][timeSlot] = (entries as ScheduleEntry[]).map((entry: ScheduleEntry) => ({ ...entry }));
    }
  }

  return result;
}

/**
 * Deep copy an individual
 */
function deepCopyIndividual(individual: Individual): Individual {
  return {
    schedule: deepCopy(individual.schedule),
    fitness: individual.fitness,
  };
}
