const RULES = [
  [/power|outlet|plug/i, 'zap'],
  [/monitor|screen|tv/i, 'monitor'],
  [/whiteboard/i, 'image'],
  [/video|conferenc/i, 'video'],
  [/projector/i, 'video'],
  [/catering|coffee|snack/i, 'coffee'],
  [/soundproof|quiet/i, 'volume-x'],
  [/chair|ergonomic/i, 'armchair'],
];

export default function amenityIcon(text) {
  const match = RULES.find(([re]) => re.test(text));
  return match ? match[1] : 'tag';
}
