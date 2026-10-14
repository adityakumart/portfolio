import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HlmToaster } from '@spartan-ng/hel/sonner';

@Component({
  imports: [RouterModule, HlmToaster],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'portfolio-rr';
}
