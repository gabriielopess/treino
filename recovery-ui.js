/* Correções pontuais sobre o index enviado em 30/09/2026. */
(function () {
  const style=document.createElement('style');
  style.textContent=`
  .live-note{display:block!important;visibility:visible!important;opacity:1!important;border:1px solid var(--line-strong)!important;background:var(--surface-2)!important;color:var(--text)!important;border-radius:11px!important;padding:0 10px!important;min-height:34px!important}
  .live-note::placeholder{color:var(--muted);opacity:1}
  .workout-exercise-preview{display:none!important}
  .exercise-library-card,.exercise-library-card .exercise-list-card{background:var(--surface)!important;box-shadow:none!important}
  #effortDone{width:100%;margin-top:18px;min-height:42px}
  .active-workout-pill{gap:10px!important}.active-workout-copy{min-width:0;flex:1}.active-workout-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .home-clocks{display:flex;align-items:center;gap:10px;flex-shrink:0}.home-clocks>span{display:flex;align-items:center;gap:4px;font-size:16px!important;font-weight:800;line-height:1.2;font-variant-numeric:tabular-nums}.home-clocks svg{width:15px;height:15px}.home-rest-clock{color:var(--red)}
  body.home-rest-combined #restTimer{display:none!important}
  body.workout-route:not(.rest-expanded) #restTimer{bottom:calc(8px + var(--safe-bottom))!important}
  body.workout-route:not(.rest-expanded) #restTimer .rest-timer-main small{display:none}
  body.workout-route:not(.rest-expanded) #restTimer .rest-timer-actions #restMinus,body.workout-route:not(.rest-expanded) #restTimer .rest-timer-actions #restPlus{display:block}
  body.workout-route:not(.rest-expanded) #restTimer{border-radius:18px!important}
  @media(max-width:350px){.home-clocks{gap:6px}.active-workout-copy strong{font-size:12px!important}.home-clocks>span{font-size:14px!important}}
  `;
  document.head.appendChild(style);
  const clockIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const duration=$('#activeWorkoutClock'),clocks=document.createElement('span');clocks.className='home-clocks';
  duration.replaceWith(clocks);const durationWrap=document.createElement('span');durationWrap.innerHTML=clockIcon;durationWrap.appendChild(duration);clocks.appendChild(durationWrap);
  const rest=document.createElement('span');rest.className='home-rest-clock is-hidden';rest.innerHTML=clockIcon+'<span id="homeRestClock"></span>';clocks.appendChild(rest);
  function sync(){const show=!!live?.startedAt&&state.route!=='workout';const running=show&&Number(live.restEndAt)>Date.now();document.body.classList.toggle('home-rest-combined',running);rest.classList.toggle('is-hidden',!running);if(running){$('#homeRestClock').textContent=fmtClock(Math.ceil((live.restEndAt-Date.now())/1000));$('#activeWorkoutPill').classList.remove('is-hidden');}durationWrap.title='Duração do treino';rest.title='Descanso';}
  const oldClock=updateGlobalClocks;updateGlobalClocks=function(){oldClock();sync();};
  const oldRender=render;render=function(){oldRender();sync();if(state.route==='exercises')$('#main .section .card')?.classList.add('exercise-library-card');};
  render();
})();
