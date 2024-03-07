import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';
import { createTextAndImageOverlay } from '../../../utils/createTextAndImageOverlay';

import { Currency } from '../../../utils/enums';
async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  }

  let curr = Currency.USD;
  if (message?.button === 3) {
    curr = Currency.BTC;
  }

  const { textCurrent, newImageBuffer } = await createTextAndImageOverlay(curr);

  const base64Image = (newImageBuffer && newImageBuffer.toString('base64')) || '';
  const dataUrl = `data:image/png;base64,${base64Image}`;

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: textCurrent,
        },
        {
          action: 'post',
          label: 'ETH / USD',
        },
        {
          label: 'ETH / BTC',
          action: 'post',
        },
      ],
      image: {
        src: dataUrl,
        aspectRatio: '1:1',
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
    }),
  );
}
export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
