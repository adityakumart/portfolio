import { Pipe, PipeTransform } from '@angular/core';
import { User } from '@portfolio/shared-types';

@Pipe({
  name: 'initials',
  standalone: true,
})
export class InitialsPipe implements PipeTransform {
  transform(user: User | null | undefined): string {
    if (!user) return '?';
    const first = (user.first_name || '').trim().charAt(0).toUpperCase();
    const last = (user.last_name || '').trim().charAt(0).toUpperCase();
    
    if (first || last) {
      return `${first}${last}`;
    }
    
    return user.email?.trim().charAt(0).toUpperCase() || '?';
  }
}
