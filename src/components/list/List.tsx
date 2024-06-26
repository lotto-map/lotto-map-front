import { useState } from 'react';
import styled from 'styled-components';
import ModalBasic from './Modal';
import LottoStoreItem from '@/models/LottoStoreItem';
import StoreItem from './StoreItem';
import { tablets } from '@/common/responsive';

interface ListProps {
  data: LottoStoreItem[];
  loading: boolean;
}

const List = ({ data, loading }: ListProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<number | undefined>();

  // 모달창 노출
  const showModal = () => {
    setModalOpen(true);
  };
  return (
    <ListContainer>
      <div className="content">
        <div className="content-head">
          <div>판매점 이름</div>
          <div className="tel">전화번호</div>
          <div className="address">주소</div>
          <div className="first">1등</div>
          <div className="second">2등</div>
          <div className="score">점수</div>
          <div>즐겨찾기</div>
          <div>상세보기</div>
        </div>
        {modalOpen && <ModalBasic setModalOpen={setModalOpen} selected={selected} />}

        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : (
          <div className="list">
            {data && data.length > 0 ? (
              data.map((item) => (
                <StoreItem key={item.id} store={item} showModal={showModal} setSelected={setSelected} />
              ))
            ) : (
              <div className="empty">판매점이 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </ListContainer>
  );
};

const ListContainer = styled.div`
  font-size: 13px;
  ${tablets({
    fontSize: '12px',
  })}

  .content {
    min-height: 700px;
  }

  .content-head {
    width: 100%;
    display: grid;
    grid-template-columns: 15% 15% 30% 7% 7% 7% 10% 10%;
    background-color: #f8f8f8;
    padding: 15px 10px;
    font-weight: bold;
    border-radius: 5px;
    ${tablets({
      gridTemplateColumns: '55% 15% 15% 15%',
      fontWeight: 'normal',
    })}

    svg {
      width: 20px;
      fill: #fdd440;
      display: inline-block;
      vertical-align: middle;
    }
  }
  .address,
  .tel,
  .first,
  .second {
    ${tablets({
      display: 'none',
    })}
  }

  .loading,
  .empty {
    padding: 100px;
  }
`;

export default List;
