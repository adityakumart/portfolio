import { IRRWhatsAppTemplateId } from '@portfolio/shared-types';

export interface IRRWhatsAppTemplate {
  id: IRRWhatsAppTemplateId;
  name: string;
  category: 'booking' | 'customer' | 'notification';
  description: string;
  body: string;
  variables: string[];
}

export type { IRRWhatsAppTemplateId };
