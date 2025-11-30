// /components/fee-master/FeeMasterActionButtons.tsx
"use client";
import dynamic from "next/dynamic";
const FormContainer = dynamic(() => import("@/components/FormContainer"), { ssr: false });

export default function FeeMasterActionButtons({ item }: any) {
  return (
    <td className="flex gap-2">
      <FormContainer table="fee-master" type="update" data={item} />
      <FormContainer table="fee-master" type="delete" id={item.id} />
      <FormContainer table="fee-payment" type="create" relatedData={{ masterId: item.id }} />
    </td>
  );
}
