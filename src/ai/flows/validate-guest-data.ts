'use server';

/**
 * @fileOverview This flow validates guest data to ensure it is coherent, well-formatted, and free of conflicts.
 *
 * - validateGuestData - A function that validates the guest data.
 * - ValidateGuestDataInput - The input type for the validateGuestData function.
 * - ValidateGuestDataOutput - The return type for the validateGuestData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateGuestDataInputSchema = z.object({
  guestName: z.string().describe('The guest\u0027s full name.'),
  email: z.string().email().describe('The guest\u0027s email address.'),
  address: z.string().describe('The guest\u0027s full address.'),
  checkInDate: z.string().describe('The check-in date in ISO format (YYYY-MM-DD).'),
  checkOutDate: z.string().describe('The check-out date in ISO format (YYYY-MM-DD).'),
  numberOfAdults: z.number().int().min(1).describe('The number of adults.'),
  numberOfChildren: z.number().int().min(0).describe('The number of children.'),
  roomType: z.string().describe('The type of room booked (e.g., single, double, suite).'),
  specialRequests: z.string().optional().describe('Any special requests from the guest.'),
});

export type ValidateGuestDataInput = z.infer<typeof ValidateGuestDataInputSchema>;

const ValidateGuestDataOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the guest data is valid and coherent.'),
  validationErrors: z.array(
    z.string().describe('A list of validation errors, if any.')
  ).optional(),
  correctedData: z.record(z.any()).optional().describe('A dictionary of corrected data, if any.'),
  comments: z.string().optional().describe('Any comments from the LLM about the data.'),
});

export type ValidateGuestDataOutput = z.infer<typeof ValidateGuestDataOutputSchema>;

export async function validateGuestData(input: ValidateGuestDataInput): Promise<ValidateGuestDataOutput> {
  return validateGuestDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateGuestDataPrompt',
  input: {schema: ValidateGuestDataInputSchema},
  output: {schema: ValidateGuestDataOutputSchema},
  prompt: `You are an AI assistant specializing in validating guest data for hotel bookings.

  Your task is to check the provided guest data for coherence, correct formatting, and any conflicting values.

  Here is the guest data:
  Guest Name: {{{guestName}}}
  Email: {{{email}}}
  Address: {{{address}}}
  Check-in Date: {{{checkInDate}}}
  Check-out Date: {{{checkOutDate}}}
  Number of Adults: {{{numberOfAdults}}}
  Number of Children: {{{numberOfChildren}}}
  Room Type: {{{roomType}}}
  Special Requests: {{{specialRequests}}}

  Respond with JSON that contains:

  - isValid: true if the data is valid, false otherwise.
  - validationErrors: A list of strings describing any validation errors.  Omit if isValid is true.
  - correctedData: A dictionary of corrected data fields, if any corrections were made. Omit if no corrections were made.
  - comments:  Additional comments about the validity of the data, suggestions, etc.
  `,
});

const validateGuestDataFlow = ai.defineFlow(
  {
    name: 'validateGuestDataFlow',
    inputSchema: ValidateGuestDataInputSchema,
    outputSchema: ValidateGuestDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
