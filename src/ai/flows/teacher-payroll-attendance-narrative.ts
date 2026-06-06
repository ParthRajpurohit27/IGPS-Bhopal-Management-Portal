'use server';
/**
 * @fileOverview A Genkit flow for generating a narrative summary of a teacher's attendance.
 *
 * - generateTeacherPayrollAttendanceNarrative - A function that generates an AI-powered narrative summary for a teacher's attendance.
 * - TeacherPayrollAttendanceNarrativeInput - The input type for the generateTeacherPayrollAttendanceNarrative function.
 * - TeacherPayrollAttendanceNarrativeOutput - The return type for the generateTeacherPayrollAttendanceNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TeacherPayrollAttendanceNarrativeInputSchema = z.object({
  teacherName: z.string().describe('The name of the teacher.'),
  employeeId: z.string().describe('The employee ID of the teacher.'),
  startDate: z.string().describe('The start date of the attendance report period (e.g., "YYYY-MM-DD").'),
  endDate: z.string().describe('The end date of the attendance report period (e.g., "YYYY-MM-DD").'),
  totalPresentDays: z.number().int().min(0).describe('The total number of days the teacher was marked present.'),
  totalAbsentDays: z.number().int().min(0).describe('The total number of days the teacher was marked absent.'),
  totalHolidayDays: z.number().int().min(0).describe('The total number of holidays during the report period.'),
});
export type TeacherPayrollAttendanceNarrativeInput = z.infer<typeof TeacherPayrollAttendanceNarrativeInputSchema>;

const TeacherPayrollAttendanceNarrativeOutputSchema = z.string().describe('An AI-generated narrative summary of the teacher\'s attendance patterns.');
export type TeacherPayrollAttendanceNarrativeOutput = z.infer<typeof TeacherPayrollAttendanceNarrativeOutputSchema>;

const teacherPayrollAttendancePrompt = ai.definePrompt({
  name: 'teacherPayrollAttendancePrompt',
  input: {schema: TeacherPayrollAttendanceNarrativeInputSchema},
  output: {schema: TeacherPayrollAttendanceNarrativeOutputSchema},
  prompt: `Generate a concise narrative summary for the attendance report of the following teacher. Focus on their attendance patterns, including present, absent, and holiday days for the specified period.\n\nTeacher Name: {{{teacherName}}} (Employee ID: {{{employeeId}}})\nReport Period: From {{{startDate}}} to {{{endDate}}}\nTotal Present Days: {{{totalPresentDays}}}\nTotal Absent Days: {{{totalAbsentDays}}}\nTotal Holiday Days: {{{totalHolidayDays}}}\n\nProvide a professional and clear summary that could be used to understand their work record and justify payroll calculations. Highlight any significant patterns or observations based on the data.`,
});

const teacherPayrollAttendanceNarrativeFlow = ai.defineFlow(
  {
    name: 'teacherPayrollAttendanceNarrativeFlow',
    inputSchema: TeacherPayrollAttendanceNarrativeInputSchema,
    outputSchema: TeacherPayrollAttendanceNarrativeOutputSchema,
  },
  async (input) => {
    const {output} = await teacherPayrollAttendancePrompt(input);
    return output!;
  }
);

export async function generateTeacherPayrollAttendanceNarrative(
  input: TeacherPayrollAttendanceNarrativeInput
): Promise<TeacherPayrollAttendanceNarrativeOutput> {
  try {
    return await teacherPayrollAttendanceNarrativeFlow(input);
  } catch (error) {
    // Fail-safe fallback if AI service is unavailable
    console.warn("Genkit AI service unavailable. Using standard fallback narrative.", error);
    return `Attendance summary for ${input.teacherName} (ID: ${input.employeeId}) from ${input.startDate} to ${input.endDate}. The record shows ${input.totalPresentDays} days present, ${input.totalAbsentDays} absent, and ${input.totalHolidayDays} holidays. This record serves as the basis for payroll calculation. [Standard System Summary]`;
  }
}
