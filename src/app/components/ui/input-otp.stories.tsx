import type { Meta, StoryObj } from '@storybook/react-vite'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './input-otp'

const meta = {
  title: 'Primitives/InputOTP',
  component: InputOTP,
  parameters: {
    docs: {
      description: {
        component:
          'One-time-code entry, one character per slot. Handles paste across all slots and ' +
          'backspace between them, which is the part that is tedious to build by hand.\n\n' +
          'Digits are tabular by nature here since every slot is fixed width — the same reasoning ' +
          'as **L-TY4**, applied structurally rather than through the font.',
      },
    },
  },
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

export const SixDigits: Story = {
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
}

export const FourDigits: Story = {
  render: () => (
    <InputOTP maxLength={4}>
      <InputOTPGroup>
        {[0, 1, 2, 3].map((i) => <InputOTPSlot key={i} index={i} />)}
      </InputOTPGroup>
    </InputOTP>
  ),
}
