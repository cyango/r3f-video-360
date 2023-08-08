// https://github.com/video-dev/hls.js/blob/master/docs/API.md
import Hls, { FragBufferedData, HlsConfig } from "hls.js";
import React, { useCallback, useEffect, useRef, useState } from "react";

const VideoAsset: React.FC = () => {
  const mediaPlayerRef = useRef<HTMLVideoElement & HTMLAudioElement>(null);

  const [fragBufferedData, setFragBufferedData] = useState<FragBufferedData>();

  const detectBrowser = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf("Firefox") > -1) {
      return "Mozilla Firefox";
    }
    if (userAgent.indexOf("Chrome") > -1) {
      return "Google Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
      return "Apple Safari";
    }
    if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
      return "Opera";
    }
    if (userAgent.indexOf("Edge") > -1) {
      return "Microsoft Edge";
    }
    if (userAgent.indexOf("Trident") > -1) {
      return "Internet Explorer";
    }
    return "Unknown";
  };

  const isSafariBrowser = detectBrowser() === "Apple Safari";

  // #region LISTENERS
  const onWaiting = useCallback(() => {
    console.log("Media Listener: Waiting");

    // addLoadedAsset(domElementId, false);
  }, []);

  const onPlaying = useCallback(() => {
    console.log("Media Listener: Playing");
  }, []);

  const onEnded = useCallback(() => {
    console.log("Media Listener: ended");
  }, []);

  const onCanPlay = useCallback(() => {
    console.log("Media Listener: can Play");
  }, []);

  const onPaused = useCallback(() => {}, []);

  const onStalled = useCallback(() => {
    console.log("Failed to fetch data, but trying.");

    // addLoadedAsset(domElementId, false);
  }, []);

  const onSeeking = useCallback(() => {
    console.log("SEEKING");
    // addLoadedAsset(domElementId, false);
  }, []);

  const onSeeked = useCallback(() => {
    console.log("SEEKED");
    // addLoadedAsset(domElementId, true);
  }, []);

  const onTimeUpdate = useCallback(() => {
    // if (mediaPlayer && !mediaPlayer.seeking) {
    //   // mediaPlayer.currentTime = elapsedTime / 1000;
    //   console.log('Time update', mediaPlayer.currentTime * 1000);
    // }
  }, []);

  const onError = useCallback((e: any) => {
    console.log("Error playing the media", e);
  }, []);

  const onLoadedmetadata = useCallback(() => {
    console.log("Loaded metadata");
    // addLoadedAsset(domElementId, true);
  }, []);

  const onLoaded = useCallback(() => {
    console.log("Loaded");
  }, []);

  // #endregion

  const onLoad = () => {
    mediaPlayerRef?.current?.addEventListener("waiting", onWaiting);
    mediaPlayerRef?.current?.addEventListener("playing", onPlaying);
    mediaPlayerRef?.current?.addEventListener("canplay", onCanPlay);
    mediaPlayerRef?.current?.addEventListener("ended", onEnded);
    mediaPlayerRef?.current?.addEventListener("pause", onPaused);
    mediaPlayerRef?.current?.addEventListener("stalled", onStalled);
    mediaPlayerRef?.current?.addEventListener("seeking", onSeeking);
    mediaPlayerRef?.current?.addEventListener("seeked", onSeeked);
    mediaPlayerRef?.current?.addEventListener("timeupdate", onTimeUpdate);
    mediaPlayerRef?.current?.addEventListener("error", onError);
    mediaPlayerRef?.current?.addEventListener(
      "loadedmetadata",
      onLoadedmetadata
    );
    mediaPlayerRef?.current?.addEventListener("loaded", onLoaded);
  };

  const onDestroy = () => {
    mediaPlayerRef?.current?.removeEventListener("waiting", onWaiting);
    mediaPlayerRef?.current?.removeEventListener("playing", onPlaying);
    mediaPlayerRef?.current?.removeEventListener("ended", onEnded);
    mediaPlayerRef?.current?.removeEventListener("canplay", onCanPlay);
    mediaPlayerRef?.current?.removeEventListener("pause", onPaused);
    mediaPlayerRef?.current?.removeEventListener("stalled", onStalled);
    mediaPlayerRef?.current?.removeEventListener("seeking", onSeeking);
    mediaPlayerRef?.current?.removeEventListener("seeked", onSeeked);
    mediaPlayerRef?.current?.removeEventListener("timeupdate", onTimeUpdate);
    mediaPlayerRef?.current?.removeEventListener("error", onError);
    mediaPlayerRef?.current?.removeEventListener(
      "loadedmetadata",
      onLoadedmetadata
    );
    mediaPlayerRef?.current?.removeEventListener("loaded", onLoaded);
  };

  useEffect(() => {
    const hlsConfig: Partial<HlsConfig> = {
      debug: false
      // enableWorker: true,
      // lowLatencyMode: true,
      // backBufferLength: 90,

      // Recommended settings for VOD
      // maxBufferSize: 0,
      // maxBufferLength: 30,
    };

    const hlsInstance = new Hls(hlsConfig);

    if (mediaPlayerRef.current) {
      console.log("Hls is supported?", Hls.isSupported());
      console.log("Browser", detectBrowser());

      if (isSafariBrowser) {
        // Apple Safari user agent shows when on ipad and iphone, even if we are on google chrome. We load the m3u8 source as iOS natively supports it and using it with HLS.js breaks it.
        onLoad();
      } else if (Hls.isSupported()) {
        const hlsSourceEl = mediaPlayerRef.current.querySelectorAll(
          "source"
        )[0] as HTMLSourceElement;

        hlsInstance.loadSource(hlsSourceEl.src);
        hlsInstance.attachMedia(mediaPlayerRef.current);

        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          console.log("HLS.Events.ERROR: ", event, data);
          console.log(data.type);
          console.log(data.details);

          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // try to recover network error
                hlsInstance.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hlsInstance.recoverMediaError();
                break;
              default:
                // cannot recover
                hlsInstance.destroy();

                break;
            }
          } else if (
            data.details === "internalException" &&
            data.type === "otherError"
          ) {
            const level = hlsInstance.levels.slice(-1)[0];
            // @ts-ignore
            hlsInstance.removeLevel(level, level?.urlId);

            hlsInstance.startLoad();
          }
        });

        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          /* let newLevel = 0;

          console.log(hlsInstance.levels);

          hlsInstance.levels.forEach((level, i) => {
            if (level.width < 2561) {
              newLevel = i;
            }
          });

          // setCurrentQualityLevel(newLevel);

          hlsInstance.currentLevel = newLevel;
          */

          onLoad();
        });

        // TODO SEE THIS Add event listeners to get real-time statistics
        hlsInstance.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
          // Do something with the HLS.js stats here
          console.log("HLS.js stats:", data);
          setFragBufferedData(data);

          const downloadTimeMs =
            data.stats.loading.end - data.stats.loading.start;
          const downloadedBytes = data.stats.loaded;
          if (downloadTimeMs > 0) {
            const bitrateKbps = (downloadedBytes * 8) / downloadTimeMs; // Calculate bitrate in kbps
            // setBitrate(bitrateKbps);
            console.log("bitrateKbps", bitrateKbps);
          }
        });

        hlsInstance.on(Hls.Events.FPS_DROP, (event, data) => {
          const stats = data;
          console.log("HLS.js FPS_DROP:", stats);
        });

        // }
      } else {
        console.log("Hls not supported, loading mp4 fallback");

        onLoad();
      }
    }
    // Detach media on cleanup
    return () => {
      onDestroy();

      hlsInstance.detachMedia();
      hlsInstance.destroy();
    };
  }, [mediaPlayerRef.current]);

  return (
    <video
      id={"video360"}
      ref={mediaPlayerRef}
      crossOrigin="anonymous"
      playsInline
      autoPlay
    >
      <source
        src={
          "https://dj6kogqug7mh7.cloudfront.net/userAssets/63765aae9adc71462e7a565c/87014675-2279-45e8-9b03-7978a1653816-videocopy4/levels/m3u8-master/master.m3u8"
        }
        type={"application/x-mpegURL"}
      />
    </video>
  );
};

export default VideoAsset;
