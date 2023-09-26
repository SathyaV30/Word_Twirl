import { Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType, RewardedAd } from 'react-native-google-mobile-ads';

const isDevelopment = __DEV__;

const androidAds = {
  banner: isDevelopment ? TestIds.BANNER : 'ca-app-pub-3672586083934170/9754874626',
  rewarded: isDevelopment ? TestIds.REWARDED : 'ca-app-pub-3672586083934170/5815629617',
  interstitial: isDevelopment ? TestIds.INTERSTITIAL : 'ca-app-pub-3672586083934170/1928355493',
};

const iosAds = {
  banner: isDevelopment ? TestIds.BANNER : 'ca-app-pub-3672586083934170/9259971053',
  rewarded: isDevelopment ? TestIds.REWARDED : 'ca-app-pub-3672586083934170/3078905196',
  interstitial: isDevelopment ? TestIds.INTERSTITIAL : 'ca-app-pub-3672586083934170/4391986860',
};


export const adUnitIdBanner = Platform.OS === 'android' ? androidAds.banner : iosAds.banner;
export const adUnitIdRewarded = Platform.OS === 'android' ? androidAds.rewarded : iosAds.rewarded;
export const adUnitIdInterstitial = Platform.OS === 'android' ? androidAds.interstitial : iosAds.interstitial;
