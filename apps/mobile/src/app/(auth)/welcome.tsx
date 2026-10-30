import { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Button, Chip, Screen, Typo } from '@/components/ui';
import { logoColored, wealth_coins, growth, equity, goal } from '@/constants/images';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: number;
}

const SLIDES: Slide[] = [
  {
    id: 'budget',
    title: 'Know where it goes',
    subtitle: 'Your income is split into needs, wants and savings, so every rupee has a job.',
    image: wealth_coins,
  },
  {
    id: 'splits',
    title: 'Split bills fairly',
    subtitle: 'Share rent, trips and dinners. Everyone sees exactly what they owe.',
    image: growth,
  },
  {
    id: 'equity',
    title: 'See what you own',
    subtitle: 'Track your assets and net worth in one clear place.',
    image: equity,
  },
  {
    id: 'roadmap',
    title: 'Plan your growth',
    subtitle: 'Set goals and follow a clear path to reach them.',
    image: goal,
  },
];

const LOGO_ASPECT = 2.7;
const LOGO_WIDTH = 112;

const Dot = ({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) => {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      width: interpolate(scrollX.value, input, [8, 24, 8], Extrapolation.CLAMP),
      opacity: interpolate(scrollX.value, input, [0.25, 1, 0.25], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={style} className="h-2 rounded-full bg-kalya-primary" />;
};

const Welcome = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const imageSize = Math.min(width - 48, 320);

  const goTo = (i: number) => listRef.current?.scrollToIndex({ index: i, animated: true });

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen scrollable={false} keyboardAvoiding={false} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header: logo + skip (skip is hidden, not removed, on the last slide to avoid layout shift) */}
      <View className="flex-row items-center justify-between px-6 pt-2 h-12">
        <Image
          source={logoColored}
          contentFit="contain"
          style={{ width: LOGO_WIDTH, height: LOGO_WIDTH / LOGO_ASPECT }}
        />
        <View style={{ opacity: isLast ? 0 : 1 }} pointerEvents={isLast ? 'none' : 'auto'}>
          <Chip label="Skip" size="sm" onPress={() => goTo(SLIDES.length - 1)} />
        </View>
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: 'center' }}
        renderItem={({ item }) => (
          <View style={{ width }} className="items-center px-6">
            <Image
              source={item.image}
              contentFit="contain"
              style={{ width: imageSize, height: imageSize }}
            />
            <Typo variant="display" className="text-center mt-8">
              {item.title}
            </Typo>
            <Typo variant="body-lg" tone="muted" className="text-center mt-3 max-w-xs">
              {item.subtitle}
            </Typo>
          </View>
        )}
      />

      {/* Footer: pagination + actions */}
      <View className="px-6 pb-4 gap-6">
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((s, i) => (
            <Dot key={s.id} index={i} scrollX={scrollX} width={width} />
          ))}
        </View>

        <View className="gap-2">
          <Button
            title={isLast ? 'Get started' : 'Next'}
            size="lg"
            fullWidth
            onPress={() => (isLast ? router.push('/(auth)/sign-up') : goTo(index + 1))}
          />
          <Button
            // title="I already have an account"
            title="Already a Kalya User"
            variant="glass"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/sign-in')}
          />

          {/* <Pressable onPress={() => router.replace("/(auth)/sign-in")} >
            <Typo size="caption" tone="link" >
              Already a Kalya User
            </Typo>
          </Pressable> */}
        </View>
      </View>
    </Screen>
  );
};

export default Welcome;
