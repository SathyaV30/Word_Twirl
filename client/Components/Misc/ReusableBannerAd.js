import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { adUnitIdBanner } from "../../Helper/AdHelper";
import { scaledSize } from "../../Helper/ScalingHelper";


export default function ReusableBannerAd() {
  return (
    <View style={styles.adContainer}>
      <BannerAd
        unitId={adUnitIdBanner}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    position: "absolute",
    bottom: scaledSize(16), 
    alignSelf: "center",
  },
});