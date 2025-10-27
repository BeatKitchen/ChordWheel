/** Very light debouncer for bonus wedges to reduce flicker */
export class BonusDebouncer {
  private lastB = 0;
  private lastA7 = 0;
  private firstB = 0;
  private firstA7 = 0;
  public reset(){ this.lastB=this.lastA7=this.firstB=this.firstA7=0; }
  public mark(kind:'B'|'A7', t:number){
    if(kind==='B'){ if(!this.firstB) this.firstB=t; this.lastB=t; }
    else { if(!this.firstA7) this.firstA7=t; this.lastA7=t; }
  }
  public ready(kind:'B'|'A7', t:number, delay=70){ // small delay to avoid flicker
    if(kind==='B') return this.firstB && (t - this.firstB) >= delay;
    return this.firstA7 && (t - this.firstA7) >= delay;
  }
}

/**
 * Decide if we should show a bonus: 'B' for Bm7♭5/Bdim, 'A7' for A7 family (A7 or C#dim family or A triad).
 * exactSet is a predicate that checks if the held pcs equal the provided set.
 */
export function detectBonus(
  exactSet: (need:number[])=>boolean,
  now: number,
  deb: BonusDebouncer
): 'B'|'A7'|'' {
  // Bm7b5 (11,2,5,9) or Bdim (11,2,5)
  if (exactSet([11,2,5,9]) || exactSet([11,2,5])){ deb.mark('B', now); if(deb.ready('B', now)) return 'B'; }

  // A7 or C#dim family OR bare A triad -> A7 bonus
  if (exactSet([9,1,4,7]) || exactSet([1,4,7,10]) || exactSet([1,4,7]) || exactSet([9,1,4])) {
    deb.mark('A7', now); if(deb.ready('A7', now)) return 'A7';
  }

  return '';
}
