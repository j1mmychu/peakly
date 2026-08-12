import { View } from 'react-native';
import { getScoreColor } from '../constants/theme';

export default function ScoreDot({ score }) {
  const color = getScoreColor(score);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
      }} />
    </View>
  );
}
