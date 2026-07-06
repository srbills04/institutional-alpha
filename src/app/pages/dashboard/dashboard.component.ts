import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  protected readonly metrics = [
    { label: 'Operaciones Hoy', value: '12', change: '+3', icon: 'trending_up' },
    { label: 'Win Rate', value: '78%', change: '+5%', icon: 'check_circle' },
    { label: 'Capital', value: '$24,850', change: '+2.4%', icon: 'account_balance' },
    { label: 'R:R Promedio', value: '1:3.2', change: 'Estable', icon: 'balance' },
  ];

  protected readonly activeTrades = [
    { pair: 'EUR/USD', direction: 'BUY', entry: '1.0842', sl: '1.0800', tp: '1.0950', pnl: '+32 pips' },
    { pair: 'BTC/USD', direction: 'SELL', entry: '68,420', sl: '69,000', tp: '66,800', pnl: '+120 pts' },
    { pair: 'XAU/USD', direction: 'BUY', entry: '2,348', sl: '2,340', tp: '2,365', pnl: '+8 pts' },
  ];

  protected readonly modules = [
    { name: 'Estructura Fractal', progress: 100 },
    { name: 'Liquidez Avanzada', progress: 85 },
    { name: 'Order Blocks', progress: 60 },
    { name: 'Fair Value Gaps', progress: 40 },
    { name: 'Kill Zones', progress: 20 },
    { name: 'Gestión de Riesgo', progress: 0 },
  ];
}