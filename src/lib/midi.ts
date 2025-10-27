/**
 * Lightweight MIDI binder. Keeps HarmonyWheel lean.
 * You pass in the needed refs and a detect() callback.
 */
export function createMidiBinder(opts:{
  setConnected:(v:boolean)=>void;
  setName:(s:string)=>void;
  bindToId:(id:string, acc:any)=>void;
}){
  const { setConnected, setName, bindToId } = opts;

  return async function initMidi(midiAccessRef: React.MutableRefObject<any>, onDevices:(list:any[])=>void){
    try{
      const acc:any=await (navigator as any).requestMIDIAccess({sysex:false});
      midiAccessRef.current=acc;
      const list=Array.from(acc.inputs.values());
      onDevices(list as any[]);
      if(list.length===0){ setConnected(false); setName(""); }
      acc.onstatechange=()=>{
        const fresh=Array.from(acc.inputs.values());
        onDevices(fresh as any[]);
      };
      return acc;
    }catch{
      setConnected(false); setName("");
      return null;
    }
  };
}
