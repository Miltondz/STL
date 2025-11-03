import { z } from 'zod';

// Esquema para una carta individual
const CardSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... otros campos de carta ...
});

// Esquema para una nave individual
const ShipSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... otros campos de nave ...
});

// Esquema para un evento individual
const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  // ... otros campos de evento ...
});

// Esquema para una tienda individual
const ShopSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... otros campos de tienda ...
});


// Esquema principal que envuelve todos los datos
export const ContentSchema = z.object({
  ships: z.array(ShipSchema).optional(),
  cards: z.array(CardSchema).optional(),
  encounters: z.array(EventSchema).optional(),
  hazards: z.array(EventSchema).optional(),
  shops: z.array(ShopSchema).optional(),
});

export type ValidatedContent = z.infer<typeof ContentSchema>;
