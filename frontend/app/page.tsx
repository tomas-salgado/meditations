'use client';

import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ChatThread } from '../components/chat/ChatThread';

export default function Home() {
  return (
    <Layout>
      <ChatThread />
    </Layout>
  );
}
